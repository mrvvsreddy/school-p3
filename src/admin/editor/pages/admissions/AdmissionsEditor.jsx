import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Image, Type, Layers, FileText, HelpCircle, Megaphone, Plus, Trash2, ChevronDown, ChevronRight,
    Loader2, Save, CheckCircle, FileCheck, UserCheck, School, CreditCard, GraduationCap, Baby, HeartPulse, Plane, Download
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

// Section icons
const sectionIcons = {
    hero: Image,
    process: Layers,
    requirements: FileText,
    downloads: Download,
    faq: HelpCircle,
    cta: Megaphone
};

const sectionTitles = {
    hero: 'Hero Banner',
    process: 'Admission Process',
    requirements: 'Required Documents',
    downloads: 'Downloadable Forms',
    faq: 'FAQs',
    cta: 'Call to Action'
};

const sectionBadges = {
    hero: 'Banner',
    process: '4 Steps',
    requirements: 'Checklist',
    downloads: 'Forms',
    faq: 'Accordion',
    cta: 'CTA Buttons'
};

// Icon options for steps
const stepIconOptions = [
    { value: 'FileText', label: 'Application', icon: FileText },
    { value: 'UserCheck', label: 'Assessment', icon: UserCheck },
    { value: 'School', label: 'Verification', icon: School },
    { value: 'CreditCard', label: 'Payment', icon: CreditCard },
];

// Icon options for requirements
const reqIconOptions = [
    { value: 'FileText', label: 'Form', icon: FileText },
    { value: 'GraduationCap', label: 'Transcripts', icon: GraduationCap },
    { value: 'Baby', label: 'Birth Cert', icon: Baby },
    { value: 'School', label: 'Transfer', icon: School },
    { value: 'HeartPulse', label: 'Medical', icon: HeartPulse },
    { value: 'CreditCard', label: 'ID Proof', icon: CreditCard },
    { value: 'Plane', label: 'Passport', icon: Plane },
];

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const AdmissionsEditor = ({ content, onUpdate }) => {
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
            ['steps', 'requirements', 'documents', 'faqs'].forEach(key => {
                if (sectionContent[key] && Array.isArray(sectionContent[key])) {
                    sectionContent[key] = sectionContent[key].map(item => ({
                        ...item,
                        _id: item._id || generateId()
                    }));
                }
            });

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
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('hero', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Join Our Community"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Admissions Open"
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Button Text</label>
                        <input
                            type="text"
                            value={data.apply_button_text || ''}
                            onChange={(e) => updateSectionContent('hero', 'apply_button_text', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="Apply Now"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Button URL</label>
                        <input
                            type="text"
                            value={data.apply_button_url || ''}
                            onChange={(e) => updateSectionContent('hero', 'apply_button_url', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="/apply"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Background Image URL</label>
                    <input
                        type="url"
                        value={data.image || ''}
                        onChange={(e) => updateSectionContent('hero', 'image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://..."
                    />
                </div>
            </>
        );
    };

    // Process Steps Editor
    const renderProcessEditor = () => {
        const data = getSectionData('process');
        const steps = data.steps || [];

        const updateStep = (id, field, value) => {
            const newSteps = steps.map(step => step._id === id ? { ...step, [field]: value } : step);
            updateSectionContent('process', 'steps', newSteps);
        };

        const addStep = () => {
            const newSteps = [...steps, { _id: generateId(), id: steps.length + 1, title: '', desc: '', icon: 'FileText' }];
            updateSectionContent('process', 'steps', newSteps);
        };

        const removeStep = (id) => {
            const newSteps = steps.filter(step => step._id !== id);
            updateSectionContent('process', 'steps', newSteps);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('process', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., How to Apply"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('process', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Admission Process"
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Process Steps ({steps.length})</label>
                    {steps.map((step, index) => (
                        <div key={step._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Step {index + 1}</span>
                                <button onClick={() => removeStep(step._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={step.title || ''}
                                    onChange={(e) => updateStep(step._id, 'title', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Step Title"
                                />
                                <select
                                    value={step.icon || 'FileText'}
                                    onChange={(e) => updateStep(step._id, 'icon', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    {stepIconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <textarea
                                rows="2"
                                value={step.desc || ''}
                                onChange={(e) => updateStep(step._id, 'desc', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                placeholder="Step description"
                            />
                        </div>
                    ))}
                    <button onClick={addStep} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Step
                    </button>
                </div>
            </>
        );
    };

    // Requirements Editor  
    const renderRequirementsEditor = () => {
        const data = getSectionData('requirements');
        const requirements = data.requirements || [];

        const updateReq = (id, field, value) => {
            const newReqs = requirements.map(req => req._id === id ? { ...req, [field]: value } : req);
            updateSectionContent('requirements', 'requirements', newReqs);
        };

        const addReq = () => {
            const newReqs = [...requirements, { _id: generateId(), icon: 'FileText', text: '', subtext: '' }];
            updateSectionContent('requirements', 'requirements', newReqs);
        };

        const removeReq = (id) => {
            const newReqs = requirements.filter(req => req._id !== id);
            updateSectionContent('requirements', 'requirements', newReqs);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('requirements', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Checklist"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('requirements', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Required Documents"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Image</label>
                    <input
                        type="url"
                        value={data.image || ''}
                        onChange={(e) => updateSectionContent('requirements', 'image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://..."
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Requirements ({requirements.length})</label>
                    {requirements.map((req, index) => (
                        <div key={req._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <select
                                    value={req.icon || 'FileText'}
                                    onChange={(e) => updateReq(req._id, 'icon', e.target.value)}
                                    className="px-2 py-1 border border-slate-200 rounded text-xs"
                                >
                                    {reqIconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <button onClick={() => removeReq(req._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={req.text || ''}
                                onChange={(e) => updateReq(req._id, 'text', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Document name"
                            />
                            <input
                                type="text"
                                value={req.subtext || ''}
                                onChange={(e) => updateReq(req._id, 'subtext', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Additional details"
                            />
                        </div>
                    ))}
                    <button onClick={addReq} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Requirement
                    </button>
                </div>
            </>
        );
    };

    // Downloads Editor
    const renderDownloadsEditor = () => {
        const data = getSectionData('downloads');
        const documents = data.documents || [];

        const updateDoc = (id, field, value) => {
            const newDocs = documents.map(doc => doc._id === id ? { ...doc, [field]: value } : doc);
            updateSectionContent('downloads', 'documents', newDocs);
        };

        const addDoc = () => {
            const newDocs = [...documents, { _id: generateId(), title: '', desc: '', size: '', url: '' }];
            updateSectionContent('downloads', 'documents', newDocs);
        };

        const removeDoc = (id) => {
            const newDocs = documents.filter(doc => doc._id !== id);
            updateSectionContent('downloads', 'documents', newDocs);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('downloads', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Resources"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('downloads', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Downloadable Forms"
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Documents ({documents.length})</label>
                    {documents.map((doc, index) => (
                        <div key={doc._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Document {index + 1}</span>
                                <button onClick={() => removeDoc(doc._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={doc.title || ''}
                                    onChange={(e) => updateDoc(doc._id, 'title', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Document title"
                                />
                                <input
                                    type="text"
                                    value={doc.size || ''}
                                    onChange={(e) => updateDoc(doc._id, 'size', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="File size (e.g., 1.2 MB)"
                                />
                            </div>
                            <input
                                type="text"
                                value={doc.desc || ''}
                                onChange={(e) => updateDoc(doc._id, 'desc', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Description"
                            />
                            <input
                                type="url"
                                value={doc.url || ''}
                                onChange={(e) => updateDoc(doc._id, 'url', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Download URL"
                            />
                        </div>
                    ))}
                    <button onClick={addDoc} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Document
                    </button>
                </div>
            </>
        );
    };

    // FAQ Editor
    const renderFaqEditor = () => {
        const data = getSectionData('faq');
        const faqs = data.faqs || [];

        const updateFaq = (id, field, value) => {
            const newFaqs = faqs.map(faq => faq._id === id ? { ...faq, [field]: value } : faq);
            updateSectionContent('faq', 'faqs', newFaqs);
        };

        const addFaq = () => {
            const newFaqs = [...faqs, { _id: generateId(), question: '', answer: '' }];
            updateSectionContent('faq', 'faqs', newFaqs);
        };

        const removeFaq = (id) => {
            const newFaqs = faqs.filter(faq => faq._id !== id);
            updateSectionContent('faq', 'faqs', newFaqs);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('faq', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Support"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('faq', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Frequently Asked Questions"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Intro Text</label>
                    <textarea
                        rows="2"
                        value={data.intro || ''}
                        onChange={(e) => updateSectionContent('faq', 'intro', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Introduction paragraph"
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">FAQs ({faqs.length})</label>
                    {faqs.map((faq, index) => (
                        <div key={faq._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">FAQ {index + 1}</span>
                                <button onClick={() => removeFaq(faq._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={faq.question || ''}
                                onChange={(e) => updateFaq(faq._id, 'question', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
                                placeholder="Question"
                            />
                            <textarea
                                rows="2"
                                value={faq.answer || ''}
                                onChange={(e) => updateFaq(faq._id, 'answer', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                placeholder="Answer"
                            />
                        </div>
                    ))}
                    <button onClick={addFaq} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add FAQ
                    </button>
                </div>
            </>
        );
    };

    // CTA Editor
    const renderCtaEditor = () => {
        const data = getSectionData('cta');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('cta', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Ready to Join Us?"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                    <textarea
                        rows="2"
                        value={data.subtitle || ''}
                        onChange={(e) => updateSectionContent('cta', 'subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Description text"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Primary Button Text</label>
                        <input
                            type="text"
                            value={data.primary_button?.text || ''}
                            onChange={(e) => updateSectionContent('cta', 'primary_button', { ...data.primary_button, text: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., Apply Online Now"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Primary Button URL</label>
                        <input
                            type="text"
                            value={data.primary_button?.url || ''}
                            onChange={(e) => updateSectionContent('cta', 'primary_button', { ...data.primary_button, url: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="/apply"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Secondary Button Text</label>
                        <input
                            type="text"
                            value={data.secondary_button?.text || ''}
                            onChange={(e) => updateSectionContent('cta', 'secondary_button', { ...data.secondary_button, text: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., Contact Admissions"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Secondary Button URL</label>
                        <input
                            type="text"
                            value={data.secondary_button?.url || ''}
                            onChange={(e) => updateSectionContent('cta', 'secondary_button', { ...data.secondary_button, url: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="/contact"
                        />
                    </div>
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'hero': return renderHeroEditor();
            case 'process': return renderProcessEditor();
            case 'requirements': return renderRequirementsEditor();
            case 'downloads': return renderDownloadsEditor();
            case 'faq': return renderFaqEditor();
            case 'cta': return renderCtaEditor();
            default: return <div className="p-4 text-slate-500 text-center">Editor not available.</div>;
        }
    };

    const handleSaveSection = async (sectionKey) => {
        const sectionData = localContent[sectionKey];
        if (!sectionData?.id) return;

        setSavingSection(sectionKey);
        try {
            // Clean up internal IDs
            let contentToSave = { ...sectionData.content };
            ['steps', 'requirements', 'documents', 'faqs'].forEach(key => {
                if (contentToSave[key]) {
                    contentToSave[key] = contentToSave[key].map(({ _id, ...rest }) => rest);
                }
            });

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

    const sectionOrder = ['hero', 'process', 'requirements', 'downloads', 'faq', 'cta'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit Admissions Page</h2>
                <p className="text-slate-500">Manage content for the admissions page sections.</p>
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

export default AdmissionsEditor;
