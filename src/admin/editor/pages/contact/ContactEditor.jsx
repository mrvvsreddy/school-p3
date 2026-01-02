import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Image, Type, ChevronDown, Plus, Trash2,
    Loader2, Save, Phone, Mail, Clock, MapPin, MessageSquare, Map
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
    info_cards: Phone,
    form_settings: MessageSquare,
    map: Map
};

const sectionTitles = {
    hero: 'Hero Banner',
    info_cards: 'Contact Info Cards',
    form_settings: 'Form Settings',
    map: 'Google Map'
};

const sectionBadges = {
    hero: 'Banner',
    info_cards: '4 Cards',
    form_settings: 'Subject Options',
    map: 'Embed'
};

const infoIconOptions = [
    { value: 'Phone', label: 'Phone' },
    { value: 'Mail', label: 'Email' },
    { value: 'Clock', label: 'Hours' },
    { value: 'MapPin', label: 'Address' },
];

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ContactEditor = ({ content, onUpdate }) => {
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
            ['cards', 'subjects'].forEach(key => {
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
                        placeholder="e.g., Get in Touch"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Contact Us"
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

    // Info Cards Editor
    const renderInfoCardsEditor = () => {
        const data = getSectionData('info_cards');
        const cards = data.cards || [];

        const updateCard = (id, field, value) => {
            const newCards = cards.map(c => c._id === id ? { ...c, [field]: value } : c);
            updateSectionContent('info_cards', 'cards', newCards);
        };

        const updateCardLine = (cardId, lineIndex, value) => {
            const newCards = cards.map(c => {
                if (c._id === cardId) {
                    const newLines = [...c.lines];
                    newLines[lineIndex] = value;
                    return { ...c, lines: newLines };
                }
                return c;
            });
            updateSectionContent('info_cards', 'cards', newCards);
        };

        const addCard = () => {
            const newCards = [...cards, { _id: generateId(), icon: 'Phone', title: '', lines: ['', ''] }];
            updateSectionContent('info_cards', 'cards', newCards);
        };

        const removeCard = (id) => {
            const newCards = cards.filter(c => c._id !== id);
            updateSectionContent('info_cards', 'cards', newCards);
        };

        return (
            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Contact Cards ({cards.length})</label>
                {cards.map((card, index) => (
                    <div key={card._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                            <select
                                value={card.icon || 'Phone'}
                                onChange={(e) => updateCard(card._id, 'icon', e.target.value)}
                                className="px-2 py-1 border border-slate-200 rounded text-xs"
                            >
                                {infoIconOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <button onClick={() => removeCard(card._id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={card.title || ''}
                            onChange={(e) => updateCard(card._id, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
                            placeholder="Card Title (e.g., Call Us)"
                        />
                        <div className="space-y-2">
                            <label className="text-xs text-slate-500">Lines:</label>
                            {(card.lines || ['', '']).map((line, lineIdx) => (
                                <input
                                    key={lineIdx}
                                    type="text"
                                    value={line}
                                    onChange={(e) => updateCardLine(card._id, lineIdx, e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder={`Line ${lineIdx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                <button onClick={addCard} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                    <Plus size={16} /> Add Card
                </button>
            </div>
        );
    };

    // Form Settings Editor
    const renderFormSettingsEditor = () => {
        const data = getSectionData('form_settings');
        const subjects = data.subjects || [];

        const updateSubject = (id, field, value) => {
            const newSubjects = subjects.map(s => s._id === id ? { ...s, [field]: value } : s);
            updateSectionContent('form_settings', 'subjects', newSubjects);
        };

        const addSubject = () => {
            const newSubjects = [...subjects, { _id: generateId(), value: '', label: '' }];
            updateSectionContent('form_settings', 'subjects', newSubjects);
        };

        const removeSubject = (id) => {
            const newSubjects = subjects.filter(s => s._id !== id);
            updateSectionContent('form_settings', 'subjects', newSubjects);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Form Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('form_settings', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Send us a Message"
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Subject Options ({subjects.length})</label>
                    {subjects.map((subj, index) => (
                        <div key={subj._id} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={subj.value || ''}
                                onChange={(e) => updateSubject(subj._id, 'value', e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Value (e.g., admission)"
                            />
                            <input
                                type="text"
                                value={subj.label || ''}
                                onChange={(e) => updateSubject(subj._id, 'label', e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Label (e.g., Admissions Inquiry)"
                            />
                            <button onClick={() => removeSubject(subj._id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addSubject} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Subject
                    </button>
                </div>
            </>
        );
    };

    // Map Editor
    const renderMapEditor = () => {
        const data = getSectionData('map');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Google Maps Embed URL</label>
                    <input
                        type="url"
                        value={data.embed_url || ''}
                        onChange={(e) => updateSectionContent('map', 'embed_url', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    <p className="text-xs text-slate-400 mt-1">Go to Google Maps → Share → Embed a map → Copy the src URL</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Map Height</label>
                    <input
                        type="text"
                        value={data.height || '400px'}
                        onChange={(e) => updateSectionContent('map', 'height', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., 400px"
                    />
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'hero': return renderHeroEditor();
            case 'info_cards': return renderInfoCardsEditor();
            case 'form_settings': return renderFormSettingsEditor();
            case 'map': return renderMapEditor();
            default: return <div className="p-4 text-slate-500 text-center">Editor not available.</div>;
        }
    };

    const handleSaveSection = async (sectionKey) => {
        const sectionData = localContent[sectionKey];
        if (!sectionData?.id) return;

        setSavingSection(sectionKey);
        try {
            let contentToSave = { ...sectionData.content };
            ['cards', 'subjects'].forEach(key => {
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

    const sectionOrder = ['hero', 'info_cards', 'form_settings', 'map'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit Contact Page</h2>
                <p className="text-slate-500">Manage content for the contact page sections.</p>
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

export default ContactEditor;
