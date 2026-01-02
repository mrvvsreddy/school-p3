import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Type, ChevronDown, Plus, Trash2,
    Loader2, Save, User, Users, BookOpen, Send, CheckCircle, Image
} from 'lucide-react';
import adminFetch from '../../../utils/adminApi';

// Collapsible Section Component
const Section = ({ title, icon: Icon, badge, isOpen, onToggle, children, onSave, saving, sectionKey }) => (
    <div className={`bg-white rounded-xl border transition-all duration-300 ${isOpen ? 'border-primary/30 shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}>
        <button
            className="w-full flex items-center justify-between p-5 text-left"
            onClick={onToggle}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{title}</h3>
                    {badge && <span className="text-xs text-slate-400">{badge}</span>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isOpen && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSave(sectionKey); }}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        Save Section
                    </button>
                )}
                <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-slate-400" />
                </div>
            </div>
        </button>
        {isOpen && (
            <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-5">
                {children}
            </div>
        )}
    </div>
);

const sectionIcons = {
    hero: Image,
    student_section: User,
    parent_section: Users,
    additional_section: BookOpen,
    submit_section: Send,
    success_message: CheckCircle
};

const sectionTitles = {
    hero: 'Header Banner',
    student_section: 'Student Details Section',
    parent_section: 'Parent Details Section',
    additional_section: 'Additional Info Section',
    submit_section: 'Submit Section',
    success_message: 'Success Message'
};

const sectionBadges = {
    hero: 'Banner',
    student_section: 'Grade Options',
    parent_section: 'Form Section',
    additional_section: 'Form Section',
    submit_section: 'Button',
    success_message: 'Confirmation'
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ApplyEditor = ({ content, onUpdate }) => {
    const [localContent, setLocalContent] = useState({});
    const [openSection, setOpenSection] = useState(null);
    const [savingSection, setSavingSection] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const updateTimeoutRef = useRef(null);

    // Initialize from props
    useEffect(() => {
        if (!content || content.length === 0) return;

        const contentMap = {};
        content.forEach(section => {
            let sectionContent = section.content;
            if (typeof sectionContent === 'string') {
                try {
                    sectionContent = JSON.parse(sectionContent);
                } catch (e) {
                    console.error('Failed to parse content:', e);
                    sectionContent = {};
                }
            }
            sectionContent = sectionContent || {};

            // Add IDs to arrays
            if (sectionContent.grades && Array.isArray(sectionContent.grades)) {
                sectionContent.grades = sectionContent.grades.map(item => ({
                    ...item,
                    _id: item._id || generateId()
                }));
            }

            contentMap[section.section_key] = {
                id: section.id,
                content: sectionContent,
                order_index: section.order_index,
                is_active: section.is_active
            };
        });

        setLocalContent(contentMap);
        setIsInitialized(true);
    }, [content]);

    // Debounced update to parent
    useEffect(() => {
        if (!isInitialized || !onUpdate || Object.keys(localContent).length === 0) return;

        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
            const updatedContent = content.map(section => ({
                ...section,
                content: localContent[section.section_key]?.content || section.content
            }));
            onUpdate(updatedContent);
        }, 300);

        return () => {
            if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
        };
    }, [localContent, isInitialized]);

    const getSectionData = useCallback((sectionKey) => {
        return localContent[sectionKey]?.content || {};
    }, [localContent]);

    const updateSectionContent = useCallback((sectionKey, field, value) => {
        setLocalContent(prev => ({
            ...prev,
            [sectionKey]: {
                ...prev[sectionKey],
                content: {
                    ...prev[sectionKey]?.content,
                    [field]: value
                }
            }
        }));
    }, []);

    const toggleSection = (sectionKey) => {
        setOpenSection(prev => prev === sectionKey ? null : sectionKey);
    };

    // Hero Editor
    const renderHeroEditor = () => {
        const data = getSectionData('hero');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Page Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Online Application"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                    <textarea
                        rows="2"
                        value={data.subtitle || ''}
                        onChange={(e) => updateSectionContent('hero', 'subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Description text"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Security Text</label>
                    <input
                        type="text"
                        value={data.security_text || ''}
                        onChange={(e) => updateSectionContent('hero', 'security_text', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Your data is encrypted and secure"
                    />
                </div>
            </>
        );
    };

    // Student Section Editor
    const renderStudentSectionEditor = () => {
        const data = getSectionData('student_section');
        const grades = data.grades || [];

        const updateGrade = (id, field, value) => {
            const newGrades = grades.map(g => g._id === id ? { ...g, [field]: value } : g);
            updateSectionContent('student_section', 'grades', newGrades);
        };

        const addGrade = () => {
            const newGrades = [...grades, { _id: generateId(), value: '', label: '' }];
            updateSectionContent('student_section', 'grades', newGrades);
        };

        const removeGrade = (id) => {
            const newGrades = grades.filter(g => g._id !== id);
            updateSectionContent('student_section', 'grades', newGrades);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('student_section', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Student Details"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Subtitle</label>
                    <input
                        type="text"
                        value={data.subtitle || ''}
                        onChange={(e) => updateSectionContent('student_section', 'subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Information about the child"
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Grade Options ({grades.length})</label>
                    {grades.map((grade, index) => (
                        <div key={grade._id} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={grade.value || ''}
                                onChange={(e) => updateGrade(grade._id, 'value', e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Value (e.g., 1)"
                            />
                            <input
                                type="text"
                                value={grade.label || ''}
                                onChange={(e) => updateGrade(grade._id, 'label', e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Label (e.g., Grade 1)"
                            />
                            <button onClick={() => removeGrade(grade._id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addGrade} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Grade
                    </button>
                </div>
            </>
        );
    };

    // Parent Section Editor
    const renderParentSectionEditor = () => {
        const data = getSectionData('parent_section');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('parent_section', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Parent / Guardian Details"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Subtitle</label>
                    <input
                        type="text"
                        value={data.subtitle || ''}
                        onChange={(e) => updateSectionContent('parent_section', 'subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Contact information"
                    />
                </div>
            </>
        );
    };

    // Additional Section Editor
    const renderAdditionalSectionEditor = () => {
        const data = getSectionData('additional_section');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('additional_section', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Additional Information"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Subtitle</label>
                    <input
                        type="text"
                        value={data.subtitle || ''}
                        onChange={(e) => updateSectionContent('additional_section', 'subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Address and background"
                    />
                </div>
            </>
        );
    };

    // Submit Section Editor
    const renderSubmitSectionEditor = () => {
        const data = getSectionData('submit_section');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Privacy Text</label>
                    <input
                        type="text"
                        value={data.privacy_text || ''}
                        onChange={(e) => updateSectionContent('submit_section', 'privacy_text', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Your information is protected..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Button Text</label>
                    <input
                        type="text"
                        value={data.button_text || ''}
                        onChange={(e) => updateSectionContent('submit_section', 'button_text', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Submit Application"
                    />
                </div>
            </>
        );
    };

    // Success Message Editor
    const renderSuccessMessageEditor = () => {
        const data = getSectionData('success_message');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Success Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('success_message', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Application Received!"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Success Message</label>
                    <textarea
                        rows="3"
                        value={data.message || ''}
                        onChange={(e) => updateSectionContent('success_message', 'message', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Thank you message..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Notice Text</label>
                    <input
                        type="text"
                        value={data.email_notice || ''}
                        onChange={(e) => updateSectionContent('success_message', 'email_notice', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., A confirmation email will be sent to"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Return Button Text</label>
                    <input
                        type="text"
                        value={data.button_text || ''}
                        onChange={(e) => updateSectionContent('success_message', 'button_text', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Return to Home"
                    />
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'hero': return renderHeroEditor();
            case 'student_section': return renderStudentSectionEditor();
            case 'parent_section': return renderParentSectionEditor();
            case 'additional_section': return renderAdditionalSectionEditor();
            case 'submit_section': return renderSubmitSectionEditor();
            case 'success_message': return renderSuccessMessageEditor();
            default: return <div className="p-4 text-slate-500 text-center">Editor not available.</div>;
        }
    };

    const handleSaveSection = async (sectionKey) => {
        const sectionData = localContent[sectionKey];
        if (!sectionData?.id) return;

        setSavingSection(sectionKey);
        try {
            let contentToSave = { ...sectionData.content };
            if (contentToSave.grades) {
                contentToSave.grades = contentToSave.grades.map(({ _id, ...rest }) => rest);
            }

            await adminFetch(`/site-content/sections/${sectionData.id}`, {
                method: 'PUT',
                body: JSON.stringify({ content: contentToSave })
            });
        } catch (err) {
            console.error('Failed to save section:', err);
        } finally {
            setTimeout(() => setSavingSection(null), 500);
        }
    };

    const sectionOrder = ['hero', 'student_section', 'parent_section', 'additional_section', 'submit_section', 'success_message'];
    const availableSections = sectionOrder.filter(key => localContent[key]);

    if (!content || content.length === 0) {
        return (
            <div className="p-8 text-center">
                <Loader2 className="animate-spin text-slate-400 mx-auto mb-4" size={32} />
                <p className="text-slate-500">Loading content...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-6 pb-32">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Edit Apply Page</h2>
                <p className="text-slate-500">Manage content for the application form.</p>
            </div>

            {availableSections.map((sectionKey) => (
                <Section
                    key={sectionKey}
                    title={sectionTitles[sectionKey] || sectionKey}
                    icon={sectionIcons[sectionKey] || Type}
                    isOpen={openSection === sectionKey}
                    onToggle={() => toggleSection(sectionKey)}
                    badge={sectionBadges[sectionKey]}
                    onSave={handleSaveSection}
                    saving={savingSection === sectionKey}
                    sectionKey={sectionKey}
                >
                    {renderSectionEditor(sectionKey)}
                </Section>
            ))}
        </div>
    );
};

export default ApplyEditor;
