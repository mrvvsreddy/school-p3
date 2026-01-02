import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Layout, Loader2, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import adminFetch, { getAdminToken } from '../../../utils/adminApi';
import HomeEditor from './HomeEditor';
import HomePreview from './HomePreview';

const HomePageEditor = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('split'); // 'edit', 'preview', 'split'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState([]);
    const [lastSaved, setLastSaved] = useState(null);
    const [error, setError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        // Check authentication
        const token = getAdminToken();
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchHomeContent();
    }, [navigate]);

    const fetchHomeContent = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await adminFetch('/site-content/pages/home');
            if (response.ok) {
                const data = await response.json();
                setContent(data);
                setLastSaved(new Date());
            } else {
                setError('Failed to load page content');
            }
        } catch (error) {
            console.error('Failed to fetch home content:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            setSaveSuccess(false);

            // Save each section individually
            for (const section of content) {
                const response = await adminFetch(`/site-content/sections/${section.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: section.content })
                });

                if (!response.ok) {
                    throw new Error(`Failed to save section: ${section.section_key}`);
                }
            }

            setLastSaved(new Date());
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

            // Refresh to ensure sync
            await fetchHomeContent();
        } catch (error) {
            console.error('Failed to save content:', error);
            setError(error.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleContentUpdate = (updatedContent) => {
        setContent(updatedContent);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-amber-500 mx-auto mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading homepage content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/admin/site-editor" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="font-serif font-bold text-slate-800 text-lg">Homepage Editor</h1>
                        <p className="text-xs text-slate-400 font-medium">
                            {content.length} sections • Last saved: {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setActiveTab('split')}
                        className={`hidden md:block px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'split' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Split
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Preview
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Status indicators */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    {saveSuccess && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm">
                            <CheckCircle2 size={16} />
                            <span>Saved!</span>
                        </div>
                    )}

                    <button
                        onClick={fetchHomeContent}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Reset Changes"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save All Changes
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">
                {/* Editor Section */}
                <div
                    className={`
                        flex-1 overflow-y-auto bg-[#F9FAFB]
                        ${activeTab === 'preview' ? 'hidden' : 'block'}
                        ${activeTab === 'split' ? 'w-1/2 border-r border-slate-200' : 'w-full'}
                    `}
                >
                    <HomeEditor content={content} onUpdate={handleContentUpdate} />
                </div>

                {/* Preview Section */}
                <div
                    className={`
                        flex-1 bg-slate-100 flex flex-col
                        ${activeTab === 'edit' ? 'hidden' : 'block'}
                        ${activeTab === 'split' ? 'w-1/2' : 'w-full'}
                    `}
                >
                    <div className="h-full w-full p-0">
                        <HomePreview content={content} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePageEditor;
