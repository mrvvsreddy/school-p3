import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    Plus,
    Download,
    Phone,
    Mail,
    Users,
    User,
    UserCheck,
    XCircle,
    Briefcase,
    Loader2,
    AlertTriangle,
    FileSpreadsheet,
    FileJson,
    FileText,
    ChevronDown
} from 'lucide-react';
import TeacherProfileModal from './TeacherProfileModal';
import adminFetch from './utils/adminApi';

const Teachers = () => {
    // State
    const [teachers, setTeachers] = useState([]);
    const [stats, setStats] = useState({ total: 0, male: 0, female: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, teacher: null, deleting: false });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        department: '',
        gender: '',
        dob: '',
        qualification: '',
        experience: '',
        designation: '',
        join_date: '',
        salary: '',
        phone: '',
        email: '',
        address: '',
        profile_image: ''
    });

    // Fetch on mount
    useEffect(() => {
        fetchTeachers();
        fetchStats();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await adminFetch('/teachers/');
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (err) {
            console.error('Failed to fetch teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminFetch('/teachers/stats/summary');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await adminFetch('/teachers/', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    dob: formData.dob || null,
                    join_date: formData.join_date || null
                })
            });

            if (response.ok) {
                await fetchTeachers();
                await fetchStats();
                closeModal();
            } else {
                const err = await response.json();
                alert(err.detail || 'Failed to create teacher');
            }
        } catch (err) {
            alert('Error creating teacher');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (teacherId) => {
        const teacher = teachers.find(t => t.id === teacherId);
        setDeleteConfirm({ open: true, teacher, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.teacher) return;
        setDeleteConfirm(prev => ({ ...prev, deleting: true }));

        try {
            const response = await adminFetch(`/teachers/${deleteConfirm.teacher.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchTeachers();
                await fetchStats();
                setSelectedTeacher(null);
                setDeleteConfirm({ open: false, teacher: null, deleting: false });
            } else {
                alert('Failed to delete teacher');
                setDeleteConfirm(prev => ({ ...prev, deleting: false }));
            }
        } catch (err) {
            alert('Failed to delete teacher');
            setDeleteConfirm(prev => ({ ...prev, deleting: false }));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: '',
            subject: '',
            department: '',
            gender: '',
            dob: '',
            qualification: '',
            experience: '',
            designation: '',
            join_date: '',
            salary: '',
            phone: '',
            email: '',
            address: '',
            profile_image: ''
        });
    };

    // Filter Logic
    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (teacher.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDepartment === 'All' || (teacher.department || '').includes(selectedDepartment);
        return matchesSearch && matchesDept;
    });

    // Get unique departments
    const departments = [...new Set(teachers.map(t => t.department).filter(Boolean))];

    // Filtered stats
    const filteredStats = useMemo(() => {
        if (selectedDepartment === 'All') return stats;
        const total = filteredTeachers.length;
        const male = filteredTeachers.filter(t => t.gender && t.gender.toLowerCase() === 'male').length;
        const female = filteredTeachers.filter(t => t.gender && t.gender.toLowerCase() === 'female').length;
        return { total, male, female };
    }, [selectedDepartment, filteredTeachers, stats]);

    // Export functions
    const exportData = (format) => {
        const dataToExport = filteredTeachers.map(t => ({
            'Employee ID': t.employee_id,
            'Name': t.name,
            'Subject': t.subject || 'N/A',
            'Department': t.department || 'N/A',
            'Gender': t.gender || 'N/A',
            'Designation': t.designation || 'N/A',
            'Experience': t.experience || 'N/A',
            'Qualification': t.qualification || 'N/A',
            'Phone': t.phone || 'N/A',
            'Email': t.email || 'N/A',
            'Address': t.address || 'N/A',
            'Assigned Classes': (t.assigned_class_names || []).join(', ') || 'N/A'
        }));

        const filename = selectedDepartment === 'All' ? 'all_teachers' : `${selectedDepartment.replace(/\s+/g, '_')}_teachers`;

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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{filteredStats.total}</p>
                        <p className="text-sm text-slate-500">
                            {selectedDepartment === 'All' ? 'Total Teachers' : `${selectedDepartment}`}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{filteredStats.male}</p>
                        <p className="text-sm text-slate-500">Male</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{filteredStats.female}</p>
                        <p className="text-sm text-slate-500">Female</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full sm:w-80">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search teachers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-600 placeholder:text-slate-400 outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="bg-white border text-slate-600 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#C5A572] focus:border-[#C5A572] cursor-pointer shadow-sm"
                    >
                        <option value="All">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
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
                                    <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                                        <p className="text-xs text-slate-400">{selectedDepartment === 'All' ? 'All teachers' : selectedDepartment} ({filteredTeachers.length})</p>
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
                        Add Teacher
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
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                                        <p className="text-slate-400 mt-2">Loading teachers...</p>
                                    </td>
                                </tr>
                            ) : filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No teachers found</td>
                                </tr>
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <tr
                                        key={teacher.id}
                                        onClick={() => setSelectedTeacher(teacher)}
                                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {teacher.profile_image ? (
                                                    <img src={teacher.profile_image} alt={teacher.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {teacher.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800">{teacher.name}</h3>
                                                    <p className="text-xs text-slate-400">{teacher.designation || 'Teacher'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-orange-400">{teacher.employee_id}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                                {teacher.subject || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{teacher.department || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-400" /> {teacher.phone || 'N/A'}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-2">
                                                    <Mail size={14} className="text-slate-400" /> {teacher.email || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t border-gray-50">
                    <p className="text-xs text-slate-400">Showing {filteredTeachers.length} of {teachers.length} teachers</p>
                </div>
            </div>

            {/* Add Teacher Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-serif font-bold text-slate-800">Add New Teacher</h2>
                                <p className="text-xs text-slate-500">Enter teacher details</p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Full Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="John Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Subject</label>
                                    <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="Mathematics" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                                    <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="Science" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
                                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm cursor-pointer">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Date of Birth</label>
                                    <input type="date" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Qualification</label>
                                    <input type="text" value={formData.qualification} onChange={(e) => setFormData({ ...formData, qualification: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="M.Sc, B.Ed" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Experience</label>
                                    <input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="5 Years" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Designation</label>
                                    <input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="Senior Teacher" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Join Date</label>
                                    <input type="date" value={formData.join_date} onChange={(e) => setFormData({ ...formData, join_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Salary</label>
                                    <input type="text" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="₹50,000" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="+91 98765 43210" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm" placeholder="teacher@school.com" />
                                </div>
                                <div className="space-y-1 md:col-span-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm resize-none" rows="2" placeholder="Full address..."></textarea>
                                </div>
                            </div>
                        </form>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl border-t border-gray-100 shrink-0">
                            <button type="button" onClick={closeModal} className="px-6 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
                            <button onClick={handleSubmit} disabled={saving} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#C5A572] hover:bg-[#b09060] disabled:opacity-50 flex items-center gap-2">
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                Save Teacher
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* View Teacher Profile Modal */}
            <TeacherProfileModal
                teacher={selectedTeacher}
                onClose={() => setSelectedTeacher(null)}
                onDelete={handleDelete}
                onUpdate={fetchTeachers}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleteConfirm.deleting && setDeleteConfirm({ open: false, teacher: null, deleting: false })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Remove Teacher?</h2>
                        <div className="bg-slate-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {deleteConfirm.teacher?.name?.charAt(0) || 'T'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{deleteConfirm.teacher?.name}</p>
                                    <p className="text-sm text-slate-500">{deleteConfirm.teacher?.employee_id} • {deleteConfirm.teacher?.department || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700 font-medium text-center">⚠️ This action <strong>cannot be undone</strong>. All data will be permanently deleted.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, teacher: null, deleting: false })} disabled={deleteConfirm.deleting} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50">Cancel</button>
                            <button onClick={confirmDelete} disabled={deleteConfirm.deleting} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                                {deleteConfirm.deleting ? <><Loader2 size={16} className="animate-spin" />Removing...</> : 'Yes, Remove Teacher'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Teachers;
