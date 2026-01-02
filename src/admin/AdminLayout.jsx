import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    Mail,
    ChevronDown,
    FileText,
    MessageSquare
} from 'lucide-react';
import { clearAdminSession, getAdminToken } from './utils/adminApi';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Admin Profile State
    const [adminProfile, setAdminProfile] = useState({ name: '', role: '', image: '', permissions: [] });

    const handleLogout = () => {
        clearAdminSession();
        navigate('/admin/login');
    };

    // Get cookie helper
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return '';
    };

    // Fetch permissions from API
    useEffect(() => {
        const token = getAdminToken();
        if (!token) {
            navigate('/admin/login');
            return;
        }

        // Load basic profile from cookies
        setAdminProfile({
            name: getCookie('adminName') || 'Admin',
            role: getCookie('adminRole') || 'Admin',
            image: getCookie('adminImage') || '',
            permissions: []
        });

        // Fetch full profile with permissions from API
        const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
        fetch(`${API_URL}/api/v1/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setAdminProfile(prev => ({
                    ...prev,
                    permissions: data.permissions || []
                }));
            })
            .catch(() => {
                // If API fails, continue with empty permissions (will show all for PRINCIPAL)
            });
    }, [navigate]);

    // Permission check helper
    const hasPermission = (permission) => {
        // PRINCIPAL has all permissions
        if (adminProfile.role === 'PRINCIPAL') return true;
        // Check specific permission
        return adminProfile.permissions.includes(permission);
    };

    // Menu items with required permissions
    const allMenuItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'view_dashboard' },
        { path: '/admin/students', icon: Users, label: 'Students', permission: 'view_students' },
        { path: '/admin/teachers', icon: GraduationCap, label: 'Teachers', permission: 'view_teachers' },
        { path: '/admin/class', icon: Users, label: 'Class', permission: 'view_classes' },
        { path: '/admin/exam', icon: FileText, label: 'Exam', permission: 'view_exams' },
        { path: '/admin/admissions', icon: Mail, label: 'Admissions', permission: 'view_applications' },
        { path: '/admin/contacts', icon: MessageSquare, label: 'Contact Requests', permission: 'view_contacts' },
        { path: '/admin/settings', icon: Settings, label: 'Settings', permission: 'manage_settings' },
        { path: '/admin/admins', icon: Users, label: 'Admins', permission: 'manage_admins', principalOnly: true },
    ];

    // Filter menu items based on permissions
    const menuItems = allMenuItems.filter(item => {
        // Principal-only items
        if (item.principalOnly && adminProfile.role !== 'PRINCIPAL') return false;
        // Check permission
        return hasPermission(item.permission);
    });

    return (
        <div className="min-h-screen bg-[#F0F1F5] flex font-sans text-slate-600">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-[220px] bg-white transform transition-transform duration-300 ease-in-out border-r border-gray-100
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Section */}
                    <div className="h-16 flex items-center px-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-400 rotate-45 flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-md -rotate-45"></div>
                            </div>
                            <span className="text-lg font-bold text-slate-800">ACERO</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path ||
                                (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-orange-50 text-orange-500'
                                            : 'text-slate-400 hover:bg-gray-50 hover:text-slate-600'}
                                    `}
                                >
                                    <Icon size={20} className={isActive ? 'text-orange-500' : 'group-hover:text-orange-400'} />
                                    <span className={`text-sm ${isActive ? 'text-slate-900' : ''}`}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-red-500 transition-colors w-full cursor-pointer"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-[#F0F1F5] px-6 py-4 flex items-center justify-between z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 text-slate-600 hover:bg-white rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-xl font-bold text-slate-700">Dashboard</h1>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin/editor"
                            className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-orange-500 hover:shadow-sm transition-all font-medium border border-transparent hover:border-orange-100"
                        >
                            <FileText size={18} />
                            <span>Site Editor</span>
                        </Link>

                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl cursor-pointer hover:shadow-sm transition-shadow">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                                {adminProfile.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-slate-700">{adminProfile.name || 'Admin'}</p>
                                <p className="text-xs text-slate-400">{adminProfile.role || 'Admin'}</p>
                            </div>
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-6 pb-6">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
