import { createPortal } from 'react-dom';
import {
    Search,
    Filter,
    Download,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Inbox,
    MessageSquare,
    AlertCircle
} from 'lucide-react';

const Inquiries = () => {
    const [filter, setFilter] = useState('All');
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const inquiries = [
        {
            id: 1,
            name: 'Rahul Sharma',
            email: 'rahul.s@example.com',
            phone: '+91 98765 43210',
            subject: 'Admission for Grade 5',
            message: 'I would like to know about the fee structure and admission process for Grade 5.',
            date: '27 Dec, 2025',
            status: 'New'
        },
        {
            id: 2,
            name: 'Priya Patel',
            email: 'priya.p@example.com',
            phone: '+91 98765 43211',
            subject: 'Transport Inquiry',
            message: 'Does the school transport cover the Whitefield area?',
            date: '26 Dec, 2025',
            status: 'In Progress'
        },
        {
            id: 3,
            name: 'Amit Singh',
            email: 'amit.singh@example.com',
            phone: '+91 98765 43212',
            subject: 'Sports Facilities',
            message: 'Is there a swimming pool available for students?',
            date: '25 Dec, 2025',
            status: 'Resolved'
        },
        {
            id: 4,
            name: 'Sneha Gupta',
            email: 'sneha.g@example.com',
            phone: '+91 98765 43213',
            subject: 'Admission for Kindergarten',
            message: 'When do the admissions start for the next academic year?',
            date: '24 Dec, 2025',
            status: 'New'
        },
        {
            id: 5,
            name: 'Vikram Malhotra',
            email: 'vikram.m@example.com',
            phone: '+91 98765 43214',
            subject: 'Job Application',
            message: 'I am a Math teacher with 5 years experience looking for a vacancy.',
            date: '23 Dec, 2025',
            status: 'In Progress'
        }
    ];

    // Stats Logic
    const totalInquiries = inquiries.length;
    const pendingInquiries = inquiries.filter(i => i.status === 'New' || i.status === 'In Progress').length;
    const resolvedInquiries = inquiries.filter(i => i.status === 'Resolved').length;

    // Filter Logic
    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || inquiry.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-50 text-blue-700';
            case 'In Progress': return 'bg-amber-50 text-amber-700';
            case 'Resolved': return 'bg-emerald-50 text-emerald-700';
            default: return 'bg-slate-50 text-slate-700';
        }
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
                        <p className="text-2xl font-bold text-slate-800">{totalInquiries}</p>
                        <p className="text-sm text-slate-500">Total Inquiries</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{pendingInquiries}</p>
                        <p className="text-sm text-slate-500">Pending Response</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{resolvedInquiries}</p>
                        <p className="text-sm text-slate-500">Resolved</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full sm:w-80">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search inquiries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-600 placeholder:text-slate-400"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-white border text-slate-600 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-[#C5A572] focus:border-[#C5A572] cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
                    >
                        <option value="All">All Status</option>
                        <option value="New">New</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap">
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Search Bar - REMOVED (Moved to controls) */}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject & Message</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredInquiries.map((inquiry) => (
                                <tr
                                    key={inquiry.id}
                                    onClick={() => setSelectedInquiry(inquiry)}
                                    className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                {inquiry.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">{inquiry.name}</h3>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="text-sm font-bold text-slate-800 mb-0.5">{inquiry.subject}</div>
                                        <p className="text-xs text-slate-500 line-clamp-1">{inquiry.message}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                                <Phone size={14} className="text-slate-400" /> {inquiry.phone}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-2">
                                                <Mail size={14} className="text-slate-400" /> {inquiry.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                            <Calendar size={16} className="text-slate-400" />
                                            {inquiry.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(inquiry.status)}`}>
                                            {inquiry.status === 'New' && <Clock size={14} />}
                                            {inquiry.status === 'In Progress' && <Clock size={14} className="animate-pulse" />}
                                            {inquiry.status === 'Resolved' && <CheckCircle size={14} />}
                                            {inquiry.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">Showing {filteredInquiries.length} of {totalInquiries} inquiries</p>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 text-xs hover:bg-[#2C3E50] hover:text-white hover:border-[#2C3E50] transition-colors">&lt;</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2C3E50] text-white text-xs font-bold shadow-md">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 text-xs hover:bg-slate-50 transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 text-xs hover:bg-[#2C3E50] hover:text-white hover:border-[#2C3E50] transition-colors">&gt;</button>
                    </div>
                </div>
            </div>

            {/* View Inquiry Modal */}
            {selectedInquiry && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedInquiry(null)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                                    {selectedInquiry.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">{selectedInquiry.name}</h2>
                                    <p className="text-xs text-slate-500">{selectedInquiry.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedInquiry.status)}`}>
                                    {selectedInquiry.status}
                                </span>
                                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                    <Calendar size={14} /> {selectedInquiry.date}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                                <p className="text-base font-bold text-slate-800">{selectedInquiry.subject}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message</label>
                                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                                    {selectedInquiry.message}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Info</label>
                                <div className="flex gap-4">
                                    <a href={`tel:${selectedInquiry.phone}`} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-100 transition-colors">
                                        <Phone size={16} /> {selectedInquiry.phone}
                                    </a>
                                    <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-100 transition-colors">
                                        <Mail size={16} /> Email
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50 rounded-b-2xl shrink-0">
                            <button
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-white hover:border-gray-300 transition-all text-sm cursor-pointer"
                            >
                                Mark as Pending
                            </button>
                            <button
                                className="px-6 py-2.5 rounded-xl bg-[#2C3E50] text-white font-semibold hover:bg-[#1a252f] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all text-sm cursor-pointer flex items-center gap-2"
                            >
                                <MessageSquare size={16} />
                                Reply
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Inquiries;
