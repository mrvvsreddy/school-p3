import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    Plus,
    Download,
    Users,
    User,
    UserCheck,
    BookOpen,
    XCircle,
    X,
    Loader2,
    AlertTriangle,
    FileSpreadsheet,
    FileJson,
    FileText,
    ChevronDown,
    Clock
} from 'lucide-react';
import adminFetch from './utils/adminApi';

const Classes = () => {
    // State
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classDetails, setClassDetails] = useState({ boys: 0, girls: 0, loading: true });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, classItem: null, deleting: false });

    // Form state
    const [formData, setFormData] = useState({
        class_name: '',
        section: '',
        class_teacher_id: ''
    });

    // Fetch on mount
    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    // Fetch class details when a class is selected
    useEffect(() => {
        if (selectedClass) {
            fetchClassDetails(selectedClass.id);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await adminFetch('/classes/');
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            }
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await adminFetch('/teachers/');
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (err) {
            console.error('Failed to fetch teachers:', err);
        }
    };

    const fetchClassDetails = async (classId) => {
        setClassDetails({ boys: 0, girls: 0, loading: true });
        try {
            // Fetch students for this class to count boys/girls
            const response = await adminFetch(`/students/?class_id=${classId}`);
            if (response.ok) {
                const students = await response.json();
                const boys = students.filter(s => s.gender && s.gender.toLowerCase() === 'male').length;
                const girls = students.filter(s => s.gender && s.gender.toLowerCase() === 'female').length;
                setClassDetails({ boys, girls, loading: false });
            }
        } catch (err) {
            console.error('Failed to fetch class details:', err);
            setClassDetails({ boys: 0, girls: 0, loading: false });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await adminFetch('/classes/', {
                method: 'POST',
                body: JSON.stringify({
                    class_name: formData.class_name,
                    section: formData.section || null,
                    class_teacher_id: formData.class_teacher_id ? parseInt(formData.class_teacher_id) : null
                })
            });

            if (response.ok) {
                await fetchClasses();
                closeModal();
            } else {
                const err = await response.json();
                alert(err.detail || 'Failed to create class');
            }
        } catch (err) {
            alert('Error creating class');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (classItem) => {
        setSelectedClass(null);
        setDeleteConfirm({ open: true, classItem, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.classItem) return;
        setDeleteConfirm(prev => ({ ...prev, deleting: true }));

        try {
            const response = await adminFetch(`/classes/${deleteConfirm.classItem.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchClasses();
                setDeleteConfirm({ open: false, classItem: null, deleting: false });
            } else {
                alert('Failed to delete class');
                setDeleteConfirm(prev => ({ ...prev, deleting: false }));
            }
        } catch (err) {
            alert('Failed to delete class');
            setDeleteConfirm(prev => ({ ...prev, deleting: false }));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ class_name: '', section: '', class_teacher_id: '' });
    };

    // Filter Logic
    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cls.class_teacher_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const grade = cls.class_name.match(/\d+/)?.[0] || '';
        const matchesGrade = selectedGrade === 'All' || grade === selectedGrade;
        return matchesSearch && matchesGrade;
    });

    // Get unique grades
    const grades = [...new Set(classes.map(c => c.class_name.match(/\d+/)?.[0]).filter(Boolean))].sort((a, b) => b - a);

    // Stats Logic - based on filtered data
    const totalClasses = filteredClasses.length;
    const totalStudents = filteredClasses.reduce((acc, curr) => acc + (curr.student_count || 0), 0);

    // Export functions
    const exportData = (format) => {
        const dataToExport = filteredClasses.map(c => ({
            'Class Name': c.class_name,
            'Section': c.section || 'N/A',
            'Class Teacher': c.class_teacher_name || 'N/A',
            'Students': c.student_count || 0
        }));

        const filename = selectedGrade === 'All' ? 'all_classes' : `grade_${selectedGrade}_classes`;

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            downloadBlob(blob, `${filename}.json`);
        } else if (format === 'csv') {
            const headers = Object.keys(dataToExport[0] || {}).join(',');
            const rows = dataToExport.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
            const csv = [headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            downloadBlob(blob, `${filename}.csv`);
        } else if (format === 'excel') {
            const headers = Object.keys(dataToExport[0] || {});
            let html = '<table border="1"><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr>';
            dataToExport.forEach(row => {
                html += '<tr>';
                Object.values(row).forEach(v => html += `<td>${v}</td>`);
                html += '</tr>';
            });
            html += '</table>';
            const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
            downloadBlob(blob, `${filename}.xls`);
        }
        setExportOpen(false);
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">

            {/* Stats Cards - Only 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span> : totalClasses}
                        </p>
                        <p className="text-sm text-slate-500">Total Classes</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span> : totalStudents}
                        </p>
                        <p className="text-sm text-slate-500">Total Students</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full sm:w-80">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-600 placeholder:text-slate-400 outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="bg-white border text-slate-600 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#C5A572] focus:border-[#C5A572] cursor-pointer shadow-sm"
                    >
                        <option value="All">All Grades</option>
                        {grades.map(grade => (
                            <option key={grade} value={grade}>Grade {grade}</option>
                        ))}
                    </select>

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setExportOpen(!exportOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-50 shadow-sm"
                        >
                            <Download size={18} />
                            Export
                            <ChevronDown size={16} className={`transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {exportOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                    <button onClick={() => exportData('csv')} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                        <FileText size={18} className="text-green-500" /> Export as CSV
                                    </button>
                                    <button onClick={() => exportData('json')} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                        <FileJson size={18} className="text-blue-500" /> Export as JSON
                                    </button>
                                    <button onClick={() => exportData('excel')} className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                                        <FileSpreadsheet size={18} className="text-emerald-600" /> Export as Excel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A572] text-white rounded-xl text-sm font-bold hover:bg-[#b09060] shadow-md"
                    >
                        <Plus size={20} />
                        Add Class
                    </button>
                </div>
            </div>

            {/* Table - No Actions column */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Class Name</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Class Teacher</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Section</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                                        <p className="text-slate-400 mt-2">Loading classes...</p>
                                    </td>
                                </tr>
                            ) : filteredClasses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No classes found</td>
                                </tr>
                            ) : (
                                filteredClasses.map((cls) => {
                                    const grade = cls.class_name.match(/\d+/)?.[0] || '?';
                                    return (
                                        <tr
                                            key={cls.id}
                                            onClick={() => setSelectedClass(cls)}
                                            className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-sm">
                                                        {grade}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-800">{cls.class_name}</h3>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {cls.class_teacher_name || 'Not Assigned'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                                                    <Users size={16} className="text-slate-400" />
                                                    {cls.student_count || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                                    {cls.section || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-50">
                    <p className="text-xs text-slate-400">Showing {filteredClasses.length} of {classes.length} classes</p>
                </div>
            </div>

            {/* Add Class Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Add New Class</h2>
                                <p className="text-sm text-slate-500 mt-1">Create a new class section.</p>
                            </div>
                            <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Class Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.class_name}
                                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm"
                                    placeholder="Class 10-A"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Section</label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm cursor-pointer"
                                >
                                    <option value="">Select Section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Class Teacher</label>
                                <select
                                    value={formData.class_teacher_id}
                                    onChange={(e) => setFormData({ ...formData, class_teacher_id: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm cursor-pointer"
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50 rounded-b-2xl shrink-0">
                            <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold text-sm">Cancel</button>
                            <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 rounded-xl bg-[#2C3E50] text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-2">
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                Create Class
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Class Profile Modal */}
            {selectedClass && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="relative p-6 pb-4 border-b border-gray-100">
                            <button
                                onClick={() => setSelectedClass(null)}
                                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-2xl">
                                    {selectedClass.class_name.match(/\d+/)?.[0] || '?'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedClass.class_name}</h2>
                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mt-1">
                                        Section {selectedClass.section || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Class Teacher</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedClass.class_teacher_name || 'Not Assigned'}</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Students</p>
                                    <p className="text-sm font-bold text-slate-800">{selectedClass.student_count || 0}</p>
                                </div>
                            </div>

                            {/* Boys/Girls Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <User size={18} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-amber-600 uppercase font-bold">Boys</p>
                                        <p className="text-lg font-bold text-amber-700">
                                            {classDetails.loading ? <span className="inline-block w-6 h-5 bg-amber-200 rounded animate-pulse"></span> : classDetails.boys}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-pink-50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                        <UserCheck size={18} className="text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-pink-600 uppercase font-bold">Girls</p>
                                        <p className="text-lg font-bold text-pink-700">
                                            {classDetails.loading ? <span className="inline-block w-6 h-5 bg-pink-200 rounded animate-pulse"></span> : classDetails.girls}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Timetable */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock size={16} className="text-slate-500" />
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Today's Schedule</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">08:00 - 08:45</span>
                                        <span className="font-semibold text-slate-700">Mathematics</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">08:50 - 09:35</span>
                                        <span className="font-semibold text-slate-700">English</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">09:40 - 10:25</span>
                                        <span className="font-semibold text-slate-700">Science</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">10:30 - 11:00</span>
                                        <span className="font-semibold text-emerald-600">Break</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">11:00 - 11:45</span>
                                        <span className="font-semibold text-slate-700">Social Studies</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">11:50 - 12:35</span>
                                        <span className="font-semibold text-slate-700">Hindi</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => setSelectedClass(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleDelete(selectedClass)}
                                className="px-4 py-2.5 rounded-xl border border-red-100 text-red-500 font-semibold text-sm hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleteConfirm.deleting && setDeleteConfirm({ open: false, classItem: null, deleting: false })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Delete Class?</h2>
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
                            <p className="font-bold text-slate-800">{deleteConfirm.classItem?.class_name}</p>
                            <p className="text-sm text-slate-500">{deleteConfirm.classItem?.student_count || 0} students</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700 font-medium text-center">⚠️ This action <strong>cannot be undone</strong>.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, classItem: null, deleting: false })} disabled={deleteConfirm.deleting} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50">Cancel</button>
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

export default Classes;
