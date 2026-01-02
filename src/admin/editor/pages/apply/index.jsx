import React, { useState, useEffect } from 'react';
import { ArrowLeft, Monitor, Split, Eye, Save, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import adminFetch, { getAdminToken } from '../../../utils/adminApi';
import ApplyEditor from './ApplyEditor';
import ApplyPreview from './ApplyPreview';

const ApplyPageEditor = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('split');

    useEffect(() => {
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
            setError(null);
            const response = await adminFetch('/site-content/pages/apply');
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

    const handleSeedContent = async () => {
        try {
            setSeeding(true);
            setError(null);
            const response = await adminFetch('/site-content/seed/apply', {
                method: 'POST'
            });
            if (response.ok) {
                await fetchContent();
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                throw new Error('Failed to seed content');
            }
        } catch (err) {
            setError('Failed to create initial content');
            console.error(err);
        } finally {
            setSeeding(false);
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
                    <p className="text-slate-500">Loading Apply page content...</p>
                </div>
            </div>
        );
    }

    // Empty state - no content in database
    if (!content || content.length === 0) {
        return (
            <div className="h-screen flex flex-col bg-slate-100">
                <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 shrink-0">
                    <Link to="/admin/site-editor" className="text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Apply Page</h1>
                        <p className="text-xs text-slate-500">Edit form sections, grade options, and success message</p>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Database size={40} className="text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">No Content Yet</h2>
                        <p className="text-slate-500 mb-8">
                            The Apply page doesn't have any content in the database.
                            Click below to create the initial sections with default content.
                        </p>
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg mb-4 justify-center">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <button
                            onClick={handleSeedContent}
                            disabled={seeding}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-medium"
                        >
                            {seeding ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Creating Content...
                                </>
                            ) : (
                                <>
                                    <Database size={18} />
                                    Create Apply Content
                                </>
                            )}
                        </button>
                    </div>
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
                        <h1 className="text-lg font-bold text-slate-800">Apply Page</h1>
                        <p className="text-xs text-slate-500">Edit form sections, grade options, and success message</p>
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
                        <ApplyEditor content={content} onUpdate={handleContentUpdate} />
                    </div>
                )}

                {/* Preview Panel */}
                {(activeTab === 'preview' || activeTab === 'split') && (
                    <div className={`${activeTab === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto bg-white`}>
                        <ApplyPreview content={content} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplyPageEditor;
