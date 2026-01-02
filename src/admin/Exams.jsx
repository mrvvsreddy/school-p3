import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    Plus,
    Calendar,
    Clock,
    Edit2,
    Trash2,
    X,
    ChevronDown,
    Loader2,
    AlertTriangle,
    BookOpen
} from 'lucide-react';
import adminFetch from './utils/adminApi';

const Exams = () => {
    // State
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('2024-2025');
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, exam: null, deleting: false });

    const [formData, setFormData] = useState({
        subject: '',
        grade: '',
        academic_year: '2024-2025',
        exam_date: '',
        start_time: '',
        end_time: '',
        duration: '',
        location: '',
        participants: '0',
        status: 'Scheduled',
        color: '#3B82F6'
    });

    const educationYears = ["2024-2025", "2023-2024", "2022-2023"];

    const colorPalette = [
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Teal', value: '#14B8A6' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Green', value: '#22C55E' },
        { name: 'Orange', value: '#F97316' },
    ];

    const getColorClasses = (hexColor) => {
        switch (hexColor) {
            case '#3B82F6': return { bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
            case '#8B5CF6': return { bg: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' };
            case '#22C55E': return { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' };
            case '#14B8A6': return { bg: 'bg-teal-50 text-teal-600', dot: 'bg-teal-500' };
            case '#F97316': return { bg: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' };
            case '#EF4444': return { bg: 'bg-red-50 text-red-600', dot: 'bg-red-500' };
            default: return { bg: 'bg-slate-50 text-slate-600', dot: 'bg-slate-500' };
        }
    };

    // Fetch on mount and when year changes
    useEffect(() => {
        fetchExams();
    }, [selectedYear]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await adminFetch(`/exams/?academic_year=${selectedYear}`);
            if (response.ok) {
                const data = await response.json();
                setExams(data);
            }
        } catch (err) {
            console.error('Failed to fetch exams:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (exam = null) => {
        if (exam) {
            setFormData({
                subject: exam.subject || '',
                grade: exam.grade || '',
                academic_year: exam.academic_year || selectedYear,
                exam_date: exam.exam_date || '',
                start_time: exam.start_time ? exam.start_time.slice(0, 5) : '',
                end_time: exam.end_time ? exam.end_time.slice(0, 5) : '',
                duration: exam.duration || '',
                location: exam.location || '',
                participants: exam.participants || '0',
                status: exam.status || 'Scheduled',
                color: exam.color || '#3B82F6'
            });
            setSelectedExam(exam);
        } else {
            setFormData({
                subject: '',
                grade: '',
                academic_year: selectedYear,
                exam_date: '',
                start_time: '',
                end_time: '',
                duration: '',
                location: '',
                participants: '0',
                status: 'Scheduled',
                color: '#3B82F6'
            });
            setSelectedExam(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const endpoint = selectedExam
                ? `/exams/${selectedExam.id}`
                : `/exams/`;
            const method = selectedExam ? 'PUT' : 'POST';

            const response = await adminFetch(endpoint, {
                method,
                body: JSON.stringify({
                    ...formData,
                    exam_date: formData.exam_date || null
                })
            });

            if (response.ok) {
                await fetchExams();
                setIsModalOpen(false);
            } else {
                const err = await response.json();
                alert(err.detail || 'Failed to save exam');
            }
        } catch (err) {
            alert('Error saving exam');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (exam) => {
        setDeleteConfirm({ open: true, exam, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.exam) return;
        setDeleteConfirm(prev => ({ ...prev, deleting: true }));

        try {
            const response = await adminFetch(`/exams/${deleteConfirm.exam.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchExams();
                setDeleteConfirm({ open: false, exam: null, deleting: false });
            } else {
                alert('Failed to delete exam');
                setDeleteConfirm(prev => ({ ...prev, deleting: false }));
            }
        } catch (err) {
            alert('Failed to delete exam');
            setDeleteConfirm(prev => ({ ...prev, deleting: false }));
        }
    };

    // Get unique grades from exams
    const grades = [...new Set(exams.map(e => e.grade).filter(Boolean))];

    // Filter logic
    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exam.grade || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = selectedGrade === 'All' || exam.grade === selectedGrade;
        return matchesSearch && matchesGrade;
    });

    // Stats - based on filtered data
    const totalExams = filteredExams.length;
    const scheduledExams = filteredExams.filter(e => e.status === 'Scheduled').length;
    const completedExams = filteredExams.filter(e => e.status === 'Completed').length;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBD';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${m} ${ampm}`;
    };

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-2xl font-serif text-slate-800">Examination Schedule</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Manage exams by academic year</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-[#C5A572] hover:bg-[#b09060] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                    >
                        <Plus size={16} />
                        New Exam
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 mb-4 overflow-x-auto">
                    {educationYears.map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`pb-2 text-xs font-semibold transition-all relative whitespace-nowrap ${selectedYear === year
                                ? 'text-[#C5A572]'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {year}
                            {selectedYear === year && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A572] rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-800">
                                {loading ? <span className="inline-block w-6 h-6 bg-slate-100 rounded animate-pulse"></span> : totalExams}
                            </p>
                            <p className="text-xs text-slate-500">Total Exams</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-800">
                                {loading ? <span className="inline-block w-6 h-6 bg-slate-100 rounded animate-pulse"></span> : scheduledExams}
                            </p>
                            <p className="text-xs text-slate-500">Scheduled</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-800">
                                {loading ? <span className="inline-block w-6 h-6 bg-slate-100 rounded animate-pulse"></span> : completedExams}
                            </p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search exams..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 shadow-sm"
                        />
                    </div>
                    <div className="relative w-full sm:w-40">
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="appearance-none w-full pl-3 pr-8 py-2 bg-white border border-gray-100 rounded-lg text-xs font-medium text-slate-600 cursor-pointer shadow-sm"
                        >
                            <option value="All">All Grades</option>
                            {grades.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                </div>

                <p className="text-slate-500 text-xs mb-3">{filteredExams.length} of {exams.length} exams</p>

                {/* Cards Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {filteredExams.map((exam) => {
                            const style = getColorClasses(exam.color);
                            return (
                                <div key={exam.id} className="group bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`w-7 h-7 rounded-md ${style.bg} flex items-center justify-center`}>
                                            <Calendar size={14} />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(exam)} className="p-1 text-slate-400 hover:text-blue-500 rounded-full hover:bg-blue-50">
                                                <Edit2 size={12} />
                                            </button>
                                            <button onClick={() => handleDelete(exam)} className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <h3 className="font-serif text-sm font-bold text-slate-800 leading-tight">{exam.subject}</h3>
                                        <p className="text-slate-500 text-[10px]">{exam.grade || 'No grade'}</p>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                            <Calendar size={10} className="text-slate-400" />
                                            <span>{formatDate(exam.exam_date)}</span>
                                        </div>
                                        {(exam.start_time || exam.end_time) && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                                <Clock size={10} className="text-slate-400" />
                                                <span>{formatTime(exam.start_time)} - {formatTime(exam.end_time)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${exam.status === 'Scheduled' ? 'bg-[#FFF8EB] text-[#B98900]' :
                                            exam.status === 'Draft' ? 'bg-slate-100 text-slate-500' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            • {exam.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {exam.participants || 0} students
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add New Card */}
                        <button
                            onClick={() => handleOpenModal()}
                            className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-3 text-slate-400 hover:border-[#C5A572] hover:text-[#C5A572] transition-all min-h-[130px]"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-1.5">
                                <Plus size={16} />
                            </div>
                            <span className="font-semibold text-xs">Add Exam</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl my-auto">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-slate-800">
                                    {selectedExam ? 'Edit Exam' : 'Schedule New Exam'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {selectedExam ? 'Update exam details' : 'Create a new examination'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-5">
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Subject *</label>
                                <input
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    type="text"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                                    placeholder="e.g., Mathematics Mid-Term"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Grade</label>
                                <input
                                    value={formData.grade}
                                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                    type="text"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                                    placeholder="e.g., Grade 10-A"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm cursor-pointer"
                                >
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Date</label>
                                <input
                                    type="date"
                                    value={formData.exam_date}
                                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Start Time</label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="w-full px-2 py-2.5 rounded-lg border border-gray-200 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">End Time</label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="w-full px-2 py-2.5 rounded-lg border border-gray-200 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Duration</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                                        placeholder="2 hrs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                                    placeholder="e.g., Main Hall B"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Participants</label>
                                <input
                                    type="text"
                                    value={formData.participants}
                                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
                                    placeholder="30"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase">Color Tag</label>
                                <div className="flex gap-3 pt-0.5">
                                    {colorPalette.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            style={{ backgroundColor: color.value }}
                                            className={`w-8 h-8 rounded-lg hover:opacity-90 transition-all ring-offset-2 ${formData.color === color.value ? 'ring-2 ring-[#C5A572] scale-110' : 'ring-0 hover:scale-105'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 rounded-b-xl">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#C5A572] hover:bg-[#b09060] shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                {selectedExam ? 'Update' : 'Schedule'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleteConfirm.deleting && setDeleteConfirm({ open: false, exam: null, deleting: false })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Delete Exam?</h2>
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
                            <p className="font-bold text-slate-800">{deleteConfirm.exam?.subject}</p>
                            <p className="text-sm text-slate-500">{deleteConfirm.exam?.grade || 'No grade'}</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700 font-medium text-center">⚠️ This action <strong>cannot be undone</strong>.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, exam: null, deleting: false })} disabled={deleteConfirm.deleting} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50">Cancel</button>
                            <button onClick={confirmDelete} disabled={deleteConfirm.deleting} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                                {deleteConfirm.deleting ? <><Loader2 size={16} className="animate-spin" />Deleting...</> : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Exams;
