import React, { useState, useEffect } from 'react';
import {
    Save,
    User,
    Shield,
    Lock,
    Check,
    LogOut,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import adminFetch, { clearAdminSession } from './utils/adminApi';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('Profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');

    // Profile state
    const [profile, setProfile] = useState({
        full_name: '',
        username: '',
        role: '',
        profile_image: '',
        admin_id: ''
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Fetch profile on mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsFetching(true);
            setError('');
            const response = await adminFetch('/me');
            console.log('Profile API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Profile data:', data);
                setProfile({
                    full_name: data.full_name || '',
                    username: data.username || '',
                    role: data.role || '',
                    profile_image: data.profile_image || '',
                    admin_id: data.admin_id || ''
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Profile fetch failed:', response.status, errorData);
                setError(`Failed to load profile: ${errorData.detail || response.statusText}`);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile. Please refresh the page.');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await adminFetch('/me', {
                method: 'PUT',
                body: JSON.stringify({
                    full_name: profile.full_name,
                    profile_image: profile.profile_image
                })
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to save profile');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);

        try {
            const response = await adminFetch('/me/password', {
                method: 'PUT',
                body: JSON.stringify({
                    current_password: passwordData.currentPassword,
                    new_password: passwordData.newPassword
                })
            });

            if (response.ok) {
                setPasswordSuccess(true);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                const errorData = await response.json();
                setPasswordError(errorData.detail || 'Failed to change password');
            }
        } catch (err) {
            setPasswordError('Network error. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        clearAdminSession();
        window.location.href = '/admin/login';
    };

    const tabs = [
        { id: 'Profile', icon: User, label: 'Profile', desc: 'Personal details' },
        { id: 'Security', icon: Shield, label: 'Security', desc: 'Password & login' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    const getInitials = (name) => {
        if (!name) return 'AD';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 py-4 mb-2">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800">Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage your account preferences</p>
                </div>

                {activeTab === 'Profile' && (
                    <button
                        onClick={handleSave}
                        disabled={isLoading || isFetching}
                        className={`
                            px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all
                            ${showSuccess
                                ? 'bg-green-500 text-white shadow-green-500/30'
                                : 'bg-[#C5A572] hover:bg-[#b09060] text-white shadow-[#C5A572]/30 hover:scale-105 active:scale-95'}
                            ${isLoading ? 'opacity-80 cursor-wait' : ''}
                        `}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : showSuccess ? (
                            <>
                                <Check size={18} />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-500" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'bg-white shadow-md shadow-[#C5A572]/10 text-[#C5A572]'
                                    : 'hover:bg-white text-slate-600 hover:shadow-sm'
                                    }`}
                            >
                                <div className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                                    ${isActive ? 'bg-[#C5A572]/10' : 'bg-slate-100 group-hover:bg-[#C5A572]/5'}
                                `}>
                                    <Icon size={20} className={isActive ? 'text-[#C5A572]' : 'text-slate-500 group-hover:text-[#C5A572]'} />
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>
                                        {tab.label}
                                    </p>
                                    <p className="text-xs text-slate-400 font-medium hidden sm:block">
                                        {tab.desc}
                                    </p>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#C5A572]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm"
                        >
                            {/* PROFILE TAB */}
                            {activeTab === 'Profile' && (
                                <div className="space-y-8">
                                    {isFetching ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="animate-spin text-slate-400" size={32} />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 border-b border-gray-100">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C5A572] to-[#b09060] flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-[#C5A572]/20">
                                                    {getInitials(profile.full_name)}
                                                </div>
                                                <div className="space-y-1">
                                                    <h2 className="text-2xl font-bold text-slate-800">{profile.full_name || 'Admin User'}</h2>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 bg-[#C5A572]/10 text-[#C5A572] text-xs font-bold rounded-full border border-[#C5A572]/20">
                                                            {profile.role}
                                                        </span>
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                                            @{profile.username}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 group md:col-span-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={profile.full_name}
                                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-[#C5A572]/30 focus:shadow-lg focus:shadow-[#C5A572]/5 outline-none transition-all font-medium text-slate-700"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                                                    <input
                                                        type="text"
                                                        value={profile.username}
                                                        disabled
                                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border-2 border-transparent text-slate-500 cursor-not-allowed font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-2 group">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Admin ID</label>
                                                    <input
                                                        type="text"
                                                        value={profile.admin_id}
                                                        disabled
                                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 border-2 border-transparent text-slate-500 cursor-not-allowed font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* SECURITY TAB */}
                            {activeTab === 'Security' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">Security</h2>
                                            <p className="text-sm text-slate-500">Manage your password settings.</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>

                                    {passwordError && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                            <AlertCircle size={20} className="text-red-500" />
                                            <p className="text-red-700 text-sm font-medium">{passwordError}</p>
                                        </div>
                                    )}

                                    {passwordSuccess && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                            <Check size={20} className="text-green-500" />
                                            <p className="text-green-700 text-sm font-medium">Password updated successfully!</p>
                                        </div>
                                    )}

                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                            <Lock size={18} />
                                            Change Password
                                        </h3>
                                        <div className="space-y-4">
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#C5A572] outline-none text-sm"
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#C5A572] outline-none text-sm"
                                                />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm New Password"
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:border-[#C5A572] outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handlePasswordChange}
                                                disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                                                className="px-6 py-2.5 rounded-xl bg-[#C5A572] text-white font-bold text-sm hover:bg-[#b09060] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {passwordLoading ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        Updating...
                                                    </>
                                                ) : (
                                                    'Update Password'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
