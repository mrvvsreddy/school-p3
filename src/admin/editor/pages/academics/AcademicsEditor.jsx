import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Type, Image as ImageIcon, ChevronDown, ChevronUp, Loader2, Save, Plus, Trash2,
    Star, Compass, BookOpen, Microscope, Palette, Briefcase, Globe, Code, Music, Lightbulb
} from 'lucide-react';
import adminFetch from '../../../utils/adminApi';

// Collapsible Section Component
const Section = ({ title, icon: Icon, isOpen, onToggle, badge, children, onSave, saving, sectionKey }) => (
    <div className={`bg-white rounded-xl border transition-all duration-200 ${isOpen ? 'border-amber-200 shadow-md ring-1 ring-amber-100' : 'border-slate-200 shadow-sm'}`}>
        <div
            onClick={onToggle}
            className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={18} />
                </div>
                <span className="font-semibold text-slate-800">{title}</span>
            </div>
            <div className="flex items-center gap-3">
                {badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {badge}
                    </span>
                )}
                {isOpen ? <ChevronUp size={18} className="text-amber-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </div>
        </div>
        {isOpen && (
            <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                {children}
                {onSave && (
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSave(sectionKey); }}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 font-medium text-sm"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Section
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
);

// Section icons and titles
const sectionIcons = {
    hero: ImageIcon,
    curriculum: BookOpen,
    departments: Microscope,
    methodology: Lightbulb
};

const sectionTitles = {
    hero: 'Hero Banner',
    curriculum: 'Curriculum Structure',
    departments: 'Academic Departments',
    methodology: 'Teaching Methodology'
};

const sectionBadges = {
    hero: 'Banner',
    curriculum: '3 Tabs',
    departments: 'Cards',
    methodology: 'Cards'
};

// Department icon options
const departmentIconOptions = [
    { value: 'Microscope', label: 'Science', icon: Microscope },
    { value: 'Code', label: 'Technology', icon: Code },
    { value: 'Briefcase', label: 'Commerce', icon: Briefcase },
    { value: 'Palette', label: 'Arts', icon: Palette },
    { value: 'Globe', label: 'Humanities', icon: Globe },
    { value: 'Music', label: 'Performing Arts', icon: Music },
];

// Curriculum icon options
const curriculumIconOptions = [
    { value: 'Star', label: 'Star (Primary)', icon: Star },
    { value: 'Compass', label: 'Compass (Middle)', icon: Compass },
    { value: 'BookOpen', label: 'Book (Senior)', icon: BookOpen },
];

// Generate unique ID for new items
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const AcademicsEditor = ({ content, onUpdate }) => {
    const [localContent, setLocalContent] = useState({});
    const [openSection, setOpenSection] = useState('hero');
    const [savingSection, setSavingSection] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const updateTimeoutRef = useRef(null);

    // Initialize from props when content changes
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

            // Add IDs to curricula items
            if (sectionContent.curricula) {
                Object.keys(sectionContent.curricula).forEach(key => {
                    if (sectionContent.curricula[key]?.features) {
                        sectionContent.curricula[key].features = sectionContent.curricula[key].features.map((f, idx) => ({
                            _id: typeof f === 'object' ? f._id : `feat_${idx}_${generateId()}`,
                            text: typeof f === 'string' ? f : f.text
                        }));
                    }
                });
            }

            // Add IDs to departments
            if (sectionContent.departments && Array.isArray(sectionContent.departments)) {
                sectionContent.departments = sectionContent.departments.map(dept => ({
                    ...dept,
                    _id: dept._id || generateId()
                }));
            }

            // Add IDs to methodology cards
            if (sectionContent.cards && Array.isArray(sectionContent.cards)) {
                sectionContent.cards = sectionContent.cards.map(card => ({
                    ...card,
                    _id: card._id || generateId()
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
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [localContent, isInitialized]);

    const toggleSection = (key) => {
        setOpenSection(openSection === key ? null : key);
    };

    const getSectionData = (key) => localContent[key]?.content || {};

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
                        placeholder="e.g., Unlock Your Potential"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Academic Excellence"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                    <textarea
                        rows="2"
                        value={data.subtitle || ''}
                        onChange={(e) => updateSectionContent('hero', 'subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Brief description"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Background Image URL</label>
                    <input
                        type="url"
                        value={data.image || ''}
                        onChange={(e) => updateSectionContent('hero', 'image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://example.com/image.jpg"
                    />
                    {data.image && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                            <img src={data.image} alt="Preview" className="w-full h-24 object-cover" onError={(e) => { e.target.src = 'https://placehold.co/800x200/f1f5f9/94a3b8?text=Image' }} />
                        </div>
                    )}
                </div>
            </>
        );
    };

    // Curriculum Editor - matches live component: {curricula: {primary: {title, description, features[], image}, ...}}
    const renderCurriculumEditor = () => {
        const data = getSectionData('curriculum');
        const curricula = data.curricula || {};

        // Default curriculum structure matching live component
        const curriculumKeys = Object.keys(curricula).length > 0
            ? Object.keys(curricula)
            : ['primary', 'middle', 'senior'];

        const updateCurriculumField = (key, field, value) => {
            const newCurricula = {
                ...curricula,
                [key]: {
                    ...curricula[key],
                    [field]: value
                }
            };
            updateSectionContent('curriculum', 'curricula', newCurricula);
        };

        const addFeature = (key) => {
            const currentFeatures = curricula[key]?.features || [];
            const newFeatures = [...currentFeatures, { _id: generateId(), text: '' }];
            updateCurriculumField(key, 'features', newFeatures);
        };

        const updateFeature = (key, featureId, value) => {
            const currentFeatures = curricula[key]?.features || [];
            const newFeatures = currentFeatures.map(f =>
                f._id === featureId ? { ...f, text: value } : f
            );
            updateCurriculumField(key, 'features', newFeatures);
        };

        const removeFeature = (key, featureId) => {
            const currentFeatures = curricula[key]?.features || [];
            const newFeatures = currentFeatures.filter(f => f._id !== featureId);
            updateCurriculumField(key, 'features', newFeatures);
        };

        const getDefaultIcon = (key) => {
            if (key === 'primary') return 'Star';
            if (key === 'middle') return 'Compass';
            return 'BookOpen';
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('curriculum', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Our Pathway"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('curriculum', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Curriculum Structure"
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Curriculum Levels ({curriculumKeys.length})</label>

                    {curriculumKeys.map((key, index) => {
                        const curr = curricula[key] || {};
                        const features = curr.features || [];

                        return (
                            <div key={key} className="p-4 rounded-lg border bg-gradient-to-br from-slate-50 to-white border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-500 uppercase">
                                        {key.charAt(0).toUpperCase() + key.slice(1)} Level
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={curr.title || ''}
                                            onChange={(e) => updateCurriculumField(key, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                            placeholder="e.g., Primary Years (KG - Grade 5)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Icon</label>
                                        <select
                                            value={curr.icon || getDefaultIcon(key)}
                                            onChange={(e) => updateCurriculumField(key, 'icon', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        >
                                            {curriculumIconOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                                    <textarea
                                        rows="2"
                                        value={curr.description || ''}
                                        onChange={(e) => updateCurriculumField(key, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                        placeholder="Description of this curriculum level"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        value={curr.image || ''}
                                        onChange={(e) => updateCurriculumField(key, 'image', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Features ({features.length})</label>
                                    {features.map((feature) => (
                                        <div key={feature._id} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={feature.text || ''}
                                                onChange={(e) => updateFeature(key, feature._id, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                placeholder="Feature text"
                                            />
                                            <button
                                                onClick={() => removeFeature(key, feature._id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addFeature(key)}
                                        className="flex items-center gap-2 text-xs text-primary hover:text-primary-dark font-medium"
                                    >
                                        <Plus size={14} /> Add Feature
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };

    // Departments Editor
    const renderDepartmentsEditor = () => {
        const data = getSectionData('departments');
        const departments = data.departments || [];

        const updateDepartment = (id, field, value) => {
            const newDepts = departments.map(dept =>
                dept._id === id ? { ...dept, [field]: value } : dept
            );
            updateSectionContent('departments', 'departments', newDepts);
        };

        const removeDepartment = (id) => {
            const newDepts = departments.filter(dept => dept._id !== id);
            updateSectionContent('departments', 'departments', newDepts);
        };

        const addDepartment = () => {
            const newDepts = [...departments, { _id: generateId(), icon: 'Microscope', customIcon: '', name: '', desc: '' }];
            updateSectionContent('departments', 'departments', newDepts);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('departments', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Areas of Study"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('departments', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Academic Departments"
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Departments ({departments.length})</label>
                    {departments.map((dept, index) => (
                        <div key={dept._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Department {index + 1}</span>
                                <button
                                    onClick={() => removeDepartment(dept._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={dept.name || ''}
                                        onChange={(e) => updateDepartment(dept._id, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        placeholder="e.g., Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={dept.desc || ''}
                                        onChange={(e) => updateDepartment(dept._id, 'desc', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        placeholder="e.g., Physics, Chemistry, Biology"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Preset Icon</label>
                                    <select
                                        value={dept.icon || 'Microscope'}
                                        onChange={(e) => updateDepartment(dept._id, 'icon', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    >
                                        <option value="">-- Use Custom Icon --</option>
                                        {departmentIconOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Custom Icon URL</label>
                                    <input
                                        type="url"
                                        value={dept.customIcon || ''}
                                        onChange={(e) => updateDepartment(dept._id, 'customIcon', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                        placeholder="https://example.com/icon.svg"
                                    />
                                </div>
                            </div>

                            {/* Icon Preview */}
                            {(dept.customIcon || dept.icon) && (
                                <div className="flex items-center gap-2 pt-2">
                                    <span className="text-xs text-slate-500">Preview:</span>
                                    {dept.customIcon ? (
                                        <img
                                            src={dept.customIcon}
                                            alt="Custom icon"
                                            className="w-8 h-8 object-contain rounded bg-slate-100 p-1"
                                            onError={(e) => { e.target.src = 'https://placehold.co/32x32/f1f5f9/94a3b8?text=?' }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                                            {(() => {
                                                const IconComp = departmentIconOptions.find(o => o.value === dept.icon)?.icon || Microscope;
                                                return <IconComp size={18} />;
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addDepartment}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                    >
                        <Plus size={16} /> Add Department
                    </button>
                </div>
            </>
        );
    };

    // Methodology Editor
    const renderMethodologyEditor = () => {
        const data = getSectionData('methodology');
        const cards = data.cards || [];

        const updateCard = (id, field, value) => {
            const newCards = cards.map(card =>
                card._id === id ? { ...card, [field]: value } : card
            );
            updateSectionContent('methodology', 'cards', newCards);
        };

        const removeCard = (id) => {
            const newCards = cards.filter(card => card._id !== id);
            updateSectionContent('methodology', 'cards', newCards);
        };

        const addCard = () => {
            const newCards = [...cards, { _id: generateId(), title: '', description: '' }];
            updateSectionContent('methodology', 'cards', newCards);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('methodology', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., How We Teach"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('methodology', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Innovative Methodology"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Main Description</label>
                    <textarea
                        rows="3"
                        value={data.description || ''}
                        onChange={(e) => updateSectionContent('methodology', 'description', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Main description text"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Image URL</label>
                    <input
                        type="url"
                        value={data.image || ''}
                        onChange={(e) => updateSectionContent('methodology', 'image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://example.com/image.jpg"
                    />
                    {data.image && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                            <img src={data.image} alt="Preview" className="w-full h-24 object-cover" onError={(e) => { e.target.src = 'https://placehold.co/800x200/f1f5f9/94a3b8?text=Image' }} />
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Methodology Cards ({cards.length})</label>
                    {cards.map((card, index) => (
                        <div key={card._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Card {index + 1}</span>
                                <button
                                    onClick={() => removeCard(card._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={card.title || ''}
                                onChange={(e) => updateCard(card._id, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
                                placeholder="Card Title (e.g., Experiential)"
                            />
                            <textarea
                                rows="2"
                                value={card.description || ''}
                                onChange={(e) => updateCard(card._id, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                placeholder="Card description"
                            />
                        </div>
                    ))}
                    <button
                        onClick={addCard}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                    >
                        <Plus size={16} /> Add Methodology Card
                    </button>
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'hero': return renderHeroEditor();
            case 'curriculum': return renderCurriculumEditor();
            case 'departments': return renderDepartmentsEditor();
            case 'methodology': return renderMethodologyEditor();
            default: return <div className="p-4 text-slate-500 text-center">Editor not available.</div>;
        }
    };

    const handleSaveSection = async (sectionKey) => {
        const sectionData = localContent[sectionKey];
        if (!sectionData || !sectionData.id) return;

        setSavingSection(sectionKey);
        try {
            // Clean up internal _id fields before saving
            let contentToSave = { ...sectionData.content };

            // Clean curriculum features
            if (contentToSave.curricula) {
                contentToSave.curricula = { ...contentToSave.curricula };
                Object.keys(contentToSave.curricula).forEach(key => {
                    if (contentToSave.curricula[key]?.features) {
                        contentToSave.curricula[key] = {
                            ...contentToSave.curricula[key],
                            features: contentToSave.curricula[key].features.map(f =>
                                typeof f === 'string' ? f : f.text
                            )
                        };
                    }
                });
            }

            // Clean departments
            if (contentToSave.departments) {
                contentToSave.departments = contentToSave.departments.map(({ _id, ...rest }) => rest);
            }

            // Clean methodology cards
            if (contentToSave.cards) {
                contentToSave.cards = contentToSave.cards.map(({ _id, ...rest }) => rest);
            }

            const response = await adminFetch(`/site-content/sections/${sectionData.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    content: contentToSave,
                    order_index: sectionData.order_index,
                    is_active: sectionData.is_active
                })
            });

            if (!response.ok) throw new Error('Failed to save');

            if (onUpdate) {
                const updatedContent = content.map(s =>
                    s.section_key === sectionKey ? { ...s, content: contentToSave } : s
                );
                onUpdate(updatedContent);
            }
        } catch (error) {
            console.error('Failed to save section:', error);
            alert('Failed to save section.');
        } finally {
            setTimeout(() => setSavingSection(null), 500);
        }
    };

    const sectionOrder = ['hero', 'curriculum', 'methodology', 'departments'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit Academics Page</h2>
                <p className="text-slate-500">Manage content for the academics page sections.</p>
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

export default AcademicsEditor;
