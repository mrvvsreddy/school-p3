import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Eye, Download, CheckCircle, XCircle, Clock, Calendar, Mail, Phone, Loader2, AlertTriangle, ChevronDown, FileText, User } from 'lucide-react';

import adminFetch from './utils/adminApi';

const AdmissionRequests = () => {
    // State
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, app: null, deleting: false });

    // Fetch on mount
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await adminFetch('/applications/');
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (err) {
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId, newStatus) => {
        setUpdating(true);
        try {
            const response = await adminFetch(`/applications/${applicationId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                await fetchApplications();
                setSelectedRequest(null);
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = (app) => {
        setDeleteConfirm({ open: true, app, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.app) return;
        setDeleteConfirm(prev => ({ ...prev, deleting: true }));

        try {
            const response = await adminFetch(`/applications/${deleteConfirm.app.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchApplications();
                setDeleteConfirm({ open: false, app: null, deleting: false });
                setSelectedRequest(null);
            } else {
                alert('Failed to delete application');
                setDeleteConfirm(prev => ({ ...prev, deleting: false }));
            }
        } catch (err) {
            alert('Failed to delete application');
            setDeleteConfirm(prev => ({ ...prev, deleting: false }));
        }
    };

    // Filter logic
    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.parent_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || app.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Stats - based on filtered data
    const totalApplications = filteredApplications.length;
    const pendingCount = filteredApplications.filter(a => a.status === 'pending').length;
    const approvedCount = filteredApplications.filter(a => a.status === 'approved').length;

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (name) => {
        return name?.charAt(0).toUpperCase() || '?';
    };

    // Export function
    const exportData = () => {
        const dataToExport = filteredApplications.map(a => ({
            'Student Name': a.student_name,
            'Parent Name': a.parent_name,
            'Email': a.email,
            'Phone': a.phone,
            'Grade': a.grade_applying,
            'Status': a.status,
            'Applied On': formatDate(a.created_at)
        }));

        const csv = [
            Object.keys(dataToExport[0] || {}).join(','),
            ...dataToExport.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'admission_requests.csv';
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span> : totalApplications}
                        </p>
                        <p className="text-sm text-slate-500">Total Applications</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span> : pendingCount}
                        </p>
                        <p className="text-sm text-slate-500">Pending Review</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span> : approvedCount}
                        </p>
                        <p className="text-sm text-slate-500">Approved</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-full sm:w-auto">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 rounded-xl text-sm px-4 py-2 pr-8 cursor-pointer focus:ring-[#C5A572] focus:border-[#C5A572]"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-[#C5A572] text-white rounded-xl text-sm font-medium hover:bg-[#b09060] transition-colors"
                    >
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No applications found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApplications.map((request) => (
                                        <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedRequest(request)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#C5A572]/10 text-[#C5A572] flex items-center justify-center font-bold text-sm">
                                                        {getInitials(request.student_name)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{request.student_name}</p>
                                                        <p className="text-xs text-slate-500">{request.parent_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 font-medium">{request.grade_applying || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-slate-500">
                                                    <p>{request.email}</p>
                                                    <p>{request.phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar size={14} />
                                                    <span className="text-sm">{formatDate(request.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}
                                                    className="p-2 text-slate-400 hover:text-[#C5A572] hover:bg-[#C5A572]/10 rounded-lg transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Application Detail Modal */}
            {selectedRequest && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-slate-800">Application Details</h3>
                                <p className="text-xs text-slate-500">ID: {selectedRequest.id.slice(0, 8)}...</p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Applicant Info */}
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-[#C5A572] flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg">
                                    {getInitials(selectedRequest.student_name)}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-800 leading-tight">{selectedRequest.student_name}</h4>
                                        <p className="text-sm text-slate-500 font-medium">Applying for <span className="font-semibold text-slate-700">{selectedRequest.grade_applying || 'N/A'}</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedRequest.status)}`}>
                                            {selectedRequest.status}
                                        </span>
                                        <span className="text-xs text-slate-500">• Applied on {formatDate(selectedRequest.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Information</h5>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User size={16} className="text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Parent/Guardian</p>
                                                <p className="text-sm font-semibold text-slate-700">{selectedRequest.parent_name || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</h5>
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Email</p>
                                                <p className="text-sm font-semibold text-slate-700">{selectedRequest.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-500">Phone</p>
                                                <p className="text-sm font-semibold text-slate-700">{selectedRequest.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedRequest.notes && (
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</h5>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm text-slate-600">{selectedRequest.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-between rounded-b-2xl border-t border-gray-100 shrink-0">
                            <button
                                onClick={() => handleDelete(selectedRequest)}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                            >
                                Delete
                            </button>
                            {selectedRequest.status === 'pending' ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'rejected')}
                                        disabled={updating}
                                        className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-all disabled:opacity-50"
                                    >
                                        {updating ? <Loader2 size={16} className="animate-spin" /> : 'Reject'}
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'approved')}
                                        disabled={updating}
                                        className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-[#C5A572] hover:bg-[#b09060] shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {updating && <Loader2 size={16} className="animate-spin" />}
                                        Approve
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 transition-all"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleteConfirm.deleting && setDeleteConfirm({ open: false, app: null, deleting: false })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Delete Application?</h2>
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
                            <p className="font-bold text-slate-800">{deleteConfirm.app?.student_name}</p>
                            <p className="text-sm text-slate-500">{deleteConfirm.app?.grade_applying || 'No grade'}</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                            <p className="text-sm text-red-700 font-medium text-center">⚠️ This action <strong>cannot be undone</strong>.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, app: null, deleting: false })} disabled={deleteConfirm.deleting} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50">Cancel</button>
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

export default AdmissionRequests;
