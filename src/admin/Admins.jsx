import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Search,
    Plus,
    Shield,
    Trash2,
    Edit,
    UserCog,
    XCircle,
    Check,
    Users,
    Crown,
    Key,
    ChevronDown
} from 'lucide-react';
import adminFetch from './utils/adminApi';

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [roleTemplates, setRoleTemplates] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role_template: 'VIEW_ONLY',
        permissions: ['view_dashboard']
    });

    // Fetch admins on mount
    useEffect(() => {
        fetchAdmins();
        fetchPermissions();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await adminFetch('/admins/');
            if (response.ok) {
                const data = await response.json();
                setAdmins(data);
            }
        } catch (err) {
            console.error('Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await adminFetch('/admins/permissions');
            if (response.ok) {
                const data = await response.json();
                setAvailablePermissions(data.permissions || []);
                setRoleTemplates(data.templates || {});
            }
        } catch (err) {
            console.error('Failed to fetch permissions');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = editingAdmin
                ? `/admins/${editingAdmin.id}`
                : `/admins/`;
            const method = editingAdmin ? 'PUT' : 'POST';

            const body = editingAdmin
                ? { full_name: formData.full_name, permissions: formData.permissions }
                : {
                    username: formData.username,
                    password: formData.password,
                    full_name: formData.full_name,
                    role_template: formData.role_template,
                    permissions: formData.permissions
                };

            const response = await adminFetch(endpoint, {
                method,
                body: JSON.stringify(body)
            });

            if (response.ok) {
                fetchAdmins();
                closeModal();
            } else {
                const err = await response.json();
                alert(err.detail || 'Error saving admin');
            }
        } catch (err) {
            alert('Failed to save admin');
        }
    };

    const handleDelete = async (admin) => {
        if (!confirm(`Delete admin "${admin.username}"?`)) return;

        try {
            const response = await adminFetch(`/admins/${admin.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchAdmins();
            } else {
                const err = await response.json();
                alert(err.detail || 'Error deleting admin');
            }
        } catch (err) {
            alert('Failed to delete admin');
        }
    };

    const openEditModal = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            password: '',
            full_name: admin.full_name || '',
            role_template: 'CUSTOM',
            permissions: admin.permissions || ['view_dashboard']
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAdmin(null);
        setFormData({
            username: '',
            password: '',
            full_name: '',
            role_template: 'VIEW_ONLY',
            permissions: ['view_dashboard']
        });
    };

    const handleTemplateChange = (templateKey) => {
        const template = roleTemplates[templateKey];
        setFormData(prev => ({
            ...prev,
            role_template: templateKey,
            permissions: template ? [...template.permissions] : ['view_dashboard']
        }));
    };

    const togglePermission = (perm) => {
        // When toggling, switch to CUSTOM template
        setFormData(prev => ({
            ...prev,
            role_template: 'CUSTOM',
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    // Group permissions by category
    const permissionGroups = {
        'Students': availablePermissions.filter(p => p.includes('student')),
        'Teachers': availablePermissions.filter(p => p.includes('teacher')),
        'Classes': availablePermissions.filter(p => p.includes('class')),
        'Applications & Contacts': availablePermissions.filter(p => p.includes('application') || p.includes('contact')),
        'Other': availablePermissions.filter(p => p === 'view_dashboard' || p === 'manage_settings')
    };

    // Filter admins
    const filteredAdmins = admins.filter(admin =>
        admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const principalCount = admins.filter(a => a.role === 'PRINCIPAL').length;
    const adminCount = admins.filter(a => a.role === 'ADMIN').length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{admins.length}</p>
                        <p className="text-sm text-slate-500">Total Admins</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <Crown size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{principalCount}</p>
                        <p className="text-sm text-slate-500">Principals</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <UserCog size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{adminCount}</p>
                        <p className="text-sm text-slate-500">Regular Admins</p>
                    </div>
                </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full sm:w-80">
                    <Search className="text-slate-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-600 placeholder:text-slate-400 outline-none"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A572] text-white rounded-xl text-sm font-bold hover:bg-[#b09060] transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                >
                    <Plus size={20} />
                    Add Admin
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Permissions</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading...</td>
                                </tr>
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">No admins found</td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${admin.role === 'PRINCIPAL' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                                    {(admin.full_name || admin.username).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800">{admin.full_name || admin.username}</h3>
                                                    <p className="text-xs text-slate-400">{admin.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-orange-400">
                                            {admin.admin_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${admin.role === 'PRINCIPAL' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {admin.role === 'PRINCIPAL' ? <Crown size={12} className="inline mr-1" /> : <UserCog size={12} className="inline mr-1" />}
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {admin.permissions?.includes('all') ? (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">All Permissions</span>
                                                ) : (
                                                    <>
                                                        {(admin.permissions || []).slice(0, 3).map(p => (
                                                            <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.replace(/_/g, ' ')}</span>
                                                        ))}
                                                        {(admin.permissions || []).length > 3 && (
                                                            <span className="text-xs text-slate-400">+{admin.permissions.length - 3} more</span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${admin.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {admin.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    disabled={admin.role === 'PRINCIPAL'}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin)}
                                                    disabled={admin.role === 'PRINCIPAL'}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {editingAdmin ? 'Update admin details and permissions' : 'Create a new admin account'}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username *</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={editingAdmin}
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm transition-all disabled:opacity-50"
                                        placeholder="admin_username"
                                    />
                                </div>

                                {/* Password (only for new admin) */}
                                {!editingAdmin && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                )}

                                {/* Full Name */}
                                <div className={`space-y-1.5 ${editingAdmin ? '' : 'md:col-span-2'}`}>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-sm transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Role Template Selection */}
                            {!editingAdmin && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                        <Shield size={14} />
                                        Role Template
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {Object.entries(roleTemplates).map(([key, template]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => handleTemplateChange(key)}
                                                className={`p-3 rounded-xl border text-left transition-all ${formData.role_template === key
                                                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100'
                                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <p className={`text-sm font-semibold ${formData.role_template === key ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {template.label}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5">{template.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fine-grained Permissions */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Key size={14} />
                                    Permissions
                                    {!editingAdmin && formData.role_template !== 'CUSTOM' && (
                                        <span className="text-xs font-normal text-blue-500 ml-2">(from template, click to customize)</span>
                                    )}
                                </label>

                                {Object.entries(permissionGroups).map(([group, perms]) => (
                                    perms.length > 0 && (
                                        <div key={group} className="space-y-2">
                                            <p className="text-xs font-medium text-slate-400 uppercase">{group}</p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {perms.map(perm => (
                                                    <label
                                                        key={perm}
                                                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${formData.permissions.includes(perm)
                                                            ? 'bg-blue-50 border-blue-200'
                                                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions.includes(perm)}
                                                            onChange={() => togglePermission(perm)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${formData.permissions.includes(perm)
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'border-slate-300'
                                                            }`}>
                                                            {formData.permissions.includes(perm) && <Check size={10} className="text-white" />}
                                                        </div>
                                                        <span className="font-medium text-slate-600 capitalize leading-tight">
                                                            {perm.replace(/_/g, ' ')}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/50 rounded-b-2xl shrink-0">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-slate-600 font-semibold hover:bg-white hover:border-gray-300 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2.5 rounded-xl bg-[#2C3E50] text-white font-semibold hover:bg-[#1a252f] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all text-sm"
                            >
                                {editingAdmin ? 'Save Changes' : 'Create Admin'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Admins;
