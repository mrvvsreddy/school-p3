import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    Trash2,
    XCircle,
    Inbox,
    Mail,
    MessageSquare,
    Calendar,
    Phone,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Clock,
    ChevronDown
} from 'lucide-react';
import adminFetch from './utils/adminApi';

const ContactRequests = () => {
    // State
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, msg: null, deleting: false });

    // Fetch on mount
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await adminFetch('/contacts/');
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
        } finally {
            setLoading(false);
        }
    };


    const updateStatus = async (contactId, newStatus) => {
        setUpdating(true);
        try {
            const response = await adminFetch(`/contacts/${contactId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                await fetchContacts();
                if (selectedMessage && selectedMessage.id === contactId) {
                    setSelectedMessage({ ...selectedMessage, status: newStatus });
                }
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdating(false);
        }
    };

    const markAsRead = (id) => {
        const msg = messages.find(m => m.id === id);
        if (msg && msg.status === 'new') {
            updateStatus(id, 'read');
        }
    };

    const handleDelete = (msg) => {
        setDeleteConfirm({ open: true, msg, deleting: false });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.msg) return;
        setDeleteConfirm(prev => ({ ...prev, deleting: true }));

        try {
            const response = await adminFetch(`/contacts/${deleteConfirm.msg.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchContacts();
                setDeleteConfirm({ open: false, msg: null, deleting: false });
                setSelectedMessage(null);
            }
        } catch (err) {
            console.error('Failed to delete:', err);
            setDeleteConfirm(prev => ({ ...prev, deleting: false }));
        }
    };

    // Filter Logic
    const filteredMessages = messages.filter(msg => {
        const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (msg.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'new') return matchesSearch && msg.status === 'new';
        if (filter === 'read') return matchesSearch && msg.status === 'read';

        return matchesSearch;
    });

    // Stats Logic
    const totalRequests = filteredMessages.length;
    const newRequests = filteredMessages.filter(m => m.status === 'new').length;


    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-amber-100 text-amber-700';
            case 'read': return 'bg-blue-100 text-blue-700';

            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hrs ago`;
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Inbox size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span> : totalRequests}
                        </p>
                        <p className="text-sm text-slate-500">Total Requests</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Mail size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? <span className="inline-block w-8 h-7 bg-slate-100 rounded animate-pulse"></span> : newRequests}
                        </p>
                        <p className="text-sm text-slate-500">New Messages</p>
                    </div>
                </div>

            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full sm:w-80">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-600 placeholder:text-slate-400 outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-white border text-slate-600 border-gray-200 rounded-xl px-4 py-2.5 pr-8 text-sm cursor-pointer shadow-sm"
                        >
                            <option value="All">All Messages</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>

                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Sender</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject & Message</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredMessages.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No contact requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMessages.map((msg) => (
                                        <tr
                                            key={msg.id}
                                            onClick={() => { markAsRead(msg.id); setSelectedMessage(msg); }}
                                            className={`hover:bg-slate-50/60 transition-colors group cursor-pointer ${msg.status === 'new' ? 'bg-[#FDF8F0]/40' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${msg.status === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {msg.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-sm ${msg.status === 'new' ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{msg.name}</h3>
                                                        <div className="text-xs text-slate-400">{msg.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-sm">
                                                <div className={`text-sm mb-0.5 ${msg.status === 'new' ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                                                    {msg.subject || 'No subject'}
                                                    {msg.status === 'new' && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-500" />}
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1">{msg.message || 'No message'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(msg.status)}`}>
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium whitespace-nowrap">
                                                {formatDate(msg.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(msg); }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Info */}
                <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-xs text-slate-400">Showing {filteredMessages.length} of {messages.length} requests</p>
                </div>
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedMessage(null)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedMessage.status)}`}>
                                    {selectedMessage.status}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{selectedMessage.subject || 'No subject'}</h3>
                                    <p className="text-xs text-slate-500">{formatDate(selectedMessage.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDelete(selectedMessage)}
                                    className="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Sender Info */}
                            <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-gray-50">
                                <div className="w-12 h-12 rounded-full bg-[#C5A572] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                    {selectedMessage.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{selectedMessage.name}</p>
                                    <p className="text-sm text-slate-500">{selectedMessage.email}</p>
                                    {selectedMessage.phone && (
                                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                            <Phone size={12} /> {selectedMessage.dial_code} {selectedMessage.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
                                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                                    {selectedMessage.message || 'No message content'}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50 rounded-b-2xl shrink-0">

                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-white transition-all text-sm cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation */}
            {deleteConfirm.open && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleteConfirm.deleting && setDeleteConfirm({ open: false, msg: null, deleting: false })} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Delete Message?</h2>
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 text-center">
                            <p className="font-bold text-slate-800">{deleteConfirm.msg?.name}</p>
                            <p className="text-sm text-slate-500">{deleteConfirm.msg?.subject || 'No subject'}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm({ open: false, msg: null, deleting: false })} disabled={deleteConfirm.deleting} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-50">Cancel</button>
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

export default ContactRequests;
