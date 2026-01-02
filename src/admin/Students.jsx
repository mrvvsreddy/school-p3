import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    Plus,
    Download,
    Phone,
    Mail,
    User,
    UserCheck,
    XCircle,
    GraduationCap,
    Loader2,
    AlertTriangle,
    FileSpreadsheet,
    FileJson,
    FileText,
    ChevronDown
} from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';
import adminFetch from './utils/adminApi';

const Students = () => {
    // State
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({ total: 0, male: 0, female: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('All');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, student: null, deleting: false });
    const [exportOpen, setExportOpen] = useState(false);

    // Form state for new student
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        blood_group: '',
        religion: '',
        class_id: '',
        section: '',
        roll_no: '',
        father_name: '',
        father_occupation: '',
        mother_name: '',
        mother_occupation: '',
        email: '',
        phone: '',
        address: '',
        profile_image: ''
    });

    // Fetch students and stats on mount
    useEffect(() => {
        fetchStudents();
        fetchStats();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await adminFetch('/students/');
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
            console.error('Failed to fetch students:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminFetch('/students/stats/summary');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await adminFetch('/classes/');
            if (response.ok) {
                const data = await response.json();
                setClasses(data);
            }
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await adminFetch('/students/', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    class_id: formData.class_id ? parseInt(formData.class_id) : null,
                    dob: formData.dob || null
                })
            });

            if (response.ok) {
                await fetchStudents();
                await fetchStats();
                closeModal();
            } else {
                const err = await response.json();
                alert(err.detail || 'Failed to create student');
            }
        } catch (err) {
            alert('Error creating student');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (studentId) => {
        // Find the student to show in confirmation dialog
        const student = students.find(s => s.id === studentId);
        setDeleteConfirm({ open: true, student, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.student) return;
        setDeleteConfirm(prev => ({ ...prev, deleting: true }));

        try {
            const response = await adminFetch(`/students/${deleteConfirm.student.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchStudents();
                await fetchStats();
                setSelectedStudent(null);
                setDeleteConfirm({ open: false, student: null, deleting: false });
            } else {
                alert('Failed to delete student');
                setDeleteConfirm(prev => ({ ...prev, deleting: false }));
            }
        } catch (err) {
            alert('Failed to delete student');
            setDeleteConfirm(prev => ({ ...prev, deleting: false }));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: '',
            dob: '',
            gender: '',
            blood_group: '',
            religion: '',
            class_id: '',
            section: '',
            roll_no: '',
            father_name: '',
            father_occupation: '',
            mother_name: '',
            mother_occupation: '',
            email: '',
            phone: '',
            address: '',
            profile_image: ''
        });
    };

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.student_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = selectedClass === 'All' || (student.class_name || '').includes(selectedClass);
        return matchesSearch && matchesClass;
    });

    // Compute filtered stats based on current filter
    const filteredStats = useMemo(() => {
        if (selectedClass === 'All') {
            return stats; // Use API stats for all
        }
        // Calculate from filtered students
        const total = filteredStudents.length;
        const male = filteredStudents.filter(s => s.gender && s.gender.toLowerCase() === 'male').length;
        const female = filteredStudents.filter(s => s.gender && s.gender.toLowerCase() === 'female').length;
        return { total, male, female };
    }, [selectedClass, filteredStudents, stats]);

    // Export functions
    const exportData = (format) => {
        const dataToExport = filteredStudents.map(s => ({
            'Student ID': s.student_id,
            'Name': s.name,
            'Class': s.class_name || 'N/A',
            'Section': s.section || 'N/A',
            'Roll No': s.roll_no || 'N/A',
            'Gender': s.gender || 'N/A',
            'Date of Birth': s.dob || 'N/A',
            'Blood Group': s.blood_group || 'N/A',
            'Religion': s.religion || 'N/A',
            'Father Name': s.father_name || 'N/A',
            'Father Occupation': s.father_occupation || 'N/A',
            'Mother Name': s.mother_name || 'N/A',
            'Mother Occupation': s.mother_occupation || 'N/A',
            'Phone': s.phone || 'N/A',
            'Email': s.email || 'N/A',
            'Address': s.address || 'N/A'
        }));

        const filename = selectedClass === 'All' ? 'all_students' : `${selectedClass.replace(/\s+/g, '_')}_students`;

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
            // Create HTML table that Excel can open
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{filteredStats.total}</p>
                        <p className="text-sm text-slate-500">
                            {selectedClass === 'All' ? 'Total Students' : `${selectedClass} Strength`}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{filteredStats.male}</p>
                        <p className="text-sm text-slate-500">Boys</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{filteredStats.female}</p>
                        <p className="text-sm text-slate-500">Girls</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full sm:w-80">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-600 placeholder:text-slate-400 outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-white border text-slate-600 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#C5A572] focus:border-[#C5A572] cursor-pointer shadow-sm"
                    >
                        <option value="All">All Classes</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.class_name}>{cls.class_name}</option>
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
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={() => exportData('csv')}
                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                                    >
                                        <FileText size={18} className="text-green-500" />
                                        Export as CSV
                                    </button>
                                    <button
                                        onClick={() => exportData('json')}
                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                                    >
                                        <FileJson size={18} className="text-blue-500" />
                                        Export as JSON
                                    </button>
                                    <button
                                        onClick={() => exportData('excel')}
                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                                    >
                                        <FileSpreadsheet size={18} className="text-emerald-600" />
                                        Export as Excel
                                    </button>
                                    <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                                        <p className="text-xs text-slate-400">
                                            {selectedClass === 'All' ? 'All students' : selectedClass} ({filteredStudents.length})
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A572] text-white rounded-xl text-sm font-bold hover:bg-[#b09060] shadow-md"
                    >
                        <Plus size={20} />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Parent</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                                        <p className="text-slate-400 mt-2">Loading students...</p>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {student.profile_image ? (
                                                    <img src={student.profile_image} alt={student.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800">{student.name}</h3>
                                                    <div className="sm:hidden text-xs text-slate-400">{student.student_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-orange-400">
                                            {student.student_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                                {student.class_name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {student.father_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-400" /> {student.phone || 'N/A'}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" /> {student.email || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Results count */}
                <div className="p-6 border-t border-gray-50">
                    <p className="text-xs text-slate-400">Showing {filteredStudents.length} of {students.length} students</p>
                </div>
            </div>

            {/* Add Student Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-slate-800">Add New Student</h2>
                                <p className="text-xs text-slate-500">Enter student details to create a new record</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-8">
                            {/* Personal Details */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <div className="w-1 h-4 bg-[#C5A572] rounded-full"></div>
                                    Student Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.dob}
                                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm text-slate-600"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm text-slate-600 cursor-pointer"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blood Group</label>
                                        <select
                                            value={formData.blood_group}
                                            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm text-slate-600 cursor-pointer"
                                        >
                                            <option value="">Select Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Religion</label>
                                        <input
                                            type="text"
                                            value={formData.religion}
                                            onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="e.g. Hindu"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Details */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                    Academic Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</label>
                                        <select
                                            value={formData.class_id}
                                            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm text-slate-600 cursor-pointer"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Section</label>
                                        <select
                                            value={formData.section}
                                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm text-slate-600 cursor-pointer"
                                        >
                                            <option value="">Select Section</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Roll Number</label>
                                        <input
                                            type="text"
                                            value={formData.roll_no}
                                            onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="e.g. 21"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Parent Information */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                    Parent Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Father's Name</label>
                                        <input
                                            type="text"
                                            value={formData.father_name}
                                            onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="e.g. Robert Doe"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Father's Occupation</label>
                                        <input
                                            type="text"
                                            value={formData.father_occupation}
                                            onChange={(e) => setFormData({ ...formData, father_occupation: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="e.g. Engineer"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mother's Name</label>
                                        <input
                                            type="text"
                                            value={formData.mother_name}
                                            onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="e.g. Mary Doe"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mother's Occupation</label>
                                        <input
                                            type="text"
                                            value={formData.mother_occupation}
                                            onChange={(e) => setFormData({ ...formData, mother_occupation: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="e.g. Doctor"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="parent@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572]/20 focus:border-[#C5A572] text-sm resize-none"
                                            rows="3"
                                            placeholder="Enter full residential address..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl border-t border-gray-100 shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#C5A572] hover:bg-[#b09060] shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                Save Student
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* View Student Profile Modal */}
            <StudentProfileModal
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
                onDelete={handleDelete}
                onUpdate={fetchStudents}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !deleteConfirm.deleting && setDeleteConfirm({ open: false, student: null, deleting: false })}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        {/* Warning Icon */}
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                            Remove Student?
                        </h2>

                        {/* Student Info */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                                {deleteConfirm.student?.profile_image ? (
                                    <img
                                        src={deleteConfirm.student.profile_image}
                                        alt={deleteConfirm.student.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {deleteConfirm.student?.name?.charAt(0) || 'S'}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-slate-800">{deleteConfirm.student?.name}</p>
                                    <p className="text-sm text-slate-500">{deleteConfirm.student?.student_id} • {deleteConfirm.student?.class_name || 'No Class'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700 font-medium text-center">
                                ⚠️ This action <strong>cannot be undone</strong>. All data associated with this student will be permanently deleted.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm({ open: false, student: null, deleting: false })}
                                disabled={deleteConfirm.deleting}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteConfirm.deleting}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleteConfirm.deleting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    'Yes, Remove Student'
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Students;
