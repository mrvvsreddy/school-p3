import React, { useState, useEffect } from 'react';
import { ArrowLeft, Monitor, Split, Eye, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import adminFetch, { getAdminToken } from '../../../utils/adminApi';
import AboutEditor from './AboutEditor';
import AboutPreview from './AboutPreview';

const AboutPageEditor = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('split'); // 'edit', 'split', 'preview'

    useEffect(() => {
        // Check authentication
        const token = getAdminToken();
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchContent();
    }, [navigate]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await adminFetch('/site-content/pages/about');
            if (response.ok) {
                const data = await response.json();
                setContent(data);
            } else {
                throw new Error('Failed to fetch content');
            }
        } catch (err) {
            setError('Failed to load page content');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);
        setError(null);
        try {
            for (const section of content) {
                await adminFetch(`/site-content/sections/${section.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        content: section.content,
                        order_index: section.order_index,
                        is_active: section.is_active
                    })
                });
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save changes');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleContentUpdate = (updatedContent) => {
        setContent(updatedContent);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
                    <p className="text-slate-500">Loading About page content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/admin/site-editor" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">About Page</h1>
                        <p className="text-xs text-slate-500">Edit hero, mission, vision, timeline, and leadership</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'edit' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Monitor size={14} /> Edit
                        </button>
                        <button
                            onClick={() => setActiveTab('split')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'split' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Split size={14} /> Split
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Eye size={14} /> Preview
                        </button>
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 px-3 py-1.5 rounded-lg">
                            <AlertCircle size={14} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 px-3 py-1.5 rounded-lg">
                            <CheckCircle size={14} /> Saved successfully!
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-medium text-sm"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save All Changes
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Panel */}
                {(activeTab === 'edit' || activeTab === 'split') && (
                    <div className={`${activeTab === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto bg-slate-50 border-r border-slate-200`}>
                        <AboutEditor content={content} onUpdate={handleContentUpdate} />
                    </div>
                )}

                {/* Preview Panel */}
                {(activeTab === 'preview' || activeTab === 'split') && (
                    <div className={`${activeTab === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white`}>
                        <AboutPreview content={content} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutPageEditor;
