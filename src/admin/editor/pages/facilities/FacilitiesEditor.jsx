import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Image, Type, Layers, Plus, Trash2, ChevronDown,
    Loader2, Save, Building2, Leaf, Monitor, Shield,
    Book, FlaskConical, Trophy, Bus, Coffee, Dumbbell,
    Sun, TreePine, Droplets, Wifi, Server, Lock, Video, Users, Bell
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
    facility_grid: Building2,
    eco_initiatives: Leaf,
    digital_campus: Monitor,
    safety_security: Shield
};

const sectionTitles = {
    hero: 'Hero Banner',
    facility_grid: 'Student Amenities',
    eco_initiatives: 'Eco Initiatives',
    digital_campus: 'Digital Campus',
    safety_security: 'Safety & Security'
};

const sectionBadges = {
    hero: 'Banner',
    facility_grid: '6 Facilities',
    eco_initiatives: 'Sustainability',
    digital_campus: 'Technology',
    safety_security: 'Safety'
};

// Icon options for facility grid
const facilityIconOptions = [
    { value: 'Book', label: 'Library' },
    { value: 'FlaskConical', label: 'Labs' },
    { value: 'Trophy', label: 'Sports' },
    { value: 'Bus', label: 'Transport' },
    { value: 'Coffee', label: 'Cafeteria' },
    { value: 'Dumbbell', label: 'Fitness' },
];

// Icon options for eco
const ecoIconOptions = [
    { value: 'Sun', label: 'Solar' },
    { value: 'TreePine', label: 'Trees' },
    { value: 'Droplets', label: 'Water' },
];

// Icon options for digital
const digitalIconOptions = [
    { value: 'Wifi', label: 'WiFi' },
    { value: 'Monitor', label: 'Smart Board' },
    { value: 'Server', label: 'LMS' },
    { value: 'Lock', label: 'Security' },
];

// Icon options for safety
const safetyIconOptions = [
    { value: 'Video', label: 'Surveillance' },
    { value: 'Users', label: 'Personnel' },
    { value: 'Bell', label: 'Emergency' },
];

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const FacilitiesEditor = ({ content, onUpdate }) => {
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
            ['facilities', 'cards', 'stats', 'features'].forEach(key => {
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
                        placeholder="e.g., World-Class Infrastructure"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Campus & Facilities"
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

    // Facility Grid Editor
    const renderFacilityGridEditor = () => {
        const data = getSectionData('facility_grid');
        const facilities = data.facilities || [];

        const updateFacility = (id, field, value) => {
            const newFacilities = facilities.map(f => f._id === id ? { ...f, [field]: value } : f);
            updateSectionContent('facility_grid', 'facilities', newFacilities);
        };

        const addFacility = () => {
            const newFacilities = [...facilities, { _id: generateId(), icon: 'Book', title: '', desc: '', image: '' }];
            updateSectionContent('facility_grid', 'facilities', newFacilities);
        };

        const removeFacility = (id) => {
            const newFacilities = facilities.filter(f => f._id !== id);
            updateSectionContent('facility_grid', 'facilities', newFacilities);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('facility_grid', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Campus Life"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('facility_grid', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Student Amenities"
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Facilities ({facilities.length})</label>
                    {facilities.map((fac, index) => (
                        <div key={fac._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Facility {index + 1}</span>
                                <button onClick={() => removeFacility(fac._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={fac.title || ''}
                                    onChange={(e) => updateFacility(fac._id, 'title', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Facility Title"
                                />
                                <select
                                    value={fac.icon || 'Book'}
                                    onChange={(e) => updateFacility(fac._id, 'icon', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    {facilityIconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <textarea
                                rows="2"
                                value={fac.desc || ''}
                                onChange={(e) => updateFacility(fac._id, 'desc', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                placeholder="Facility description"
                            />
                            <input
                                type="url"
                                value={fac.image || ''}
                                onChange={(e) => updateFacility(fac._id, 'image', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Image URL"
                            />
                        </div>
                    ))}
                    <button onClick={addFacility} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Facility
                    </button>
                </div>
            </>
        );
    };

    // Eco Initiatives Editor
    const renderEcoEditor = () => {
        const data = getSectionData('eco_initiatives');
        const cards = data.cards || [];
        const stats = data.stats || [];

        const updateCard = (id, field, value) => {
            const newCards = cards.map(c => c._id === id ? { ...c, [field]: value } : c);
            updateSectionContent('eco_initiatives', 'cards', newCards);
        };

        const updateStat = (id, field, value) => {
            const newStats = stats.map(s => s._id === id ? { ...s, [field]: value } : s);
            updateSectionContent('eco_initiatives', 'stats', newStats);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('eco_initiatives', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Sustainability"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('eco_initiatives', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., A Living Laboratory"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title Highlight</label>
                    <input
                        type="text"
                        value={data.title_highlight || ''}
                        onChange={(e) => updateSectionContent('eco_initiatives', 'title_highlight', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Greener Future"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        rows="2"
                        value={data.description || ''}
                        onChange={(e) => updateSectionContent('eco_initiatives', 'description', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Description"
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Eco Cards ({cards.length})</label>
                    {cards.map((card, index) => (
                        <div key={card._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <select
                                    value={card.icon || 'Sun'}
                                    onChange={(e) => updateCard(card._id, 'icon', e.target.value)}
                                    className="px-2 py-1 border border-slate-200 rounded text-xs"
                                >
                                    {ecoIconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="text"
                                value={card.title || ''}
                                onChange={(e) => updateCard(card._id, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Card Title"
                            />
                            <input
                                type="text"
                                value={card.desc || ''}
                                onChange={(e) => updateCard(card._id, 'desc', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Description"
                            />
                            <input
                                type="url"
                                value={card.image || ''}
                                onChange={(e) => updateCard(card._id, 'image', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Image URL"
                            />
                        </div>
                    ))}
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Stats ({stats.length})</label>
                    {stats.map((stat, index) => (
                        <div key={stat._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                value={stat.value || ''}
                                onChange={(e) => updateStat(stat._id, 'value', e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Value (e.g., 40%)"
                            />
                            <input
                                type="text"
                                value={stat.label || ''}
                                onChange={(e) => updateStat(stat._id, 'label', e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Label"
                            />
                            <select
                                value={stat.color || 'emerald'}
                                onChange={(e) => updateStat(stat._id, 'color', e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            >
                                <option value="emerald">Green</option>
                                <option value="blue">Blue</option>
                                <option value="yellow">Yellow</option>
                                <option value="purple">Purple</option>
                            </select>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // Digital Campus Editor
    const renderDigitalCampusEditor = () => {
        const data = getSectionData('digital_campus');
        const features = data.features || [];

        const updateFeature = (id, field, value) => {
            const newFeatures = features.map(f => f._id === id ? { ...f, [field]: value } : f);
            updateSectionContent('digital_campus', 'features', newFeatures);
        };

        const addFeature = () => {
            const newFeatures = [...features, { _id: generateId(), icon: 'Wifi', title: '', desc: '' }];
            updateSectionContent('digital_campus', 'features', newFeatures);
        };

        const removeFeature = (id) => {
            const newFeatures = features.filter(f => f._id !== id);
            updateSectionContent('digital_campus', 'features', newFeatures);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('digital_campus', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Future Ready"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('digital_campus', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Digital Campus"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        rows="2"
                        value={data.description || ''}
                        onChange={(e) => updateSectionContent('digital_campus', 'description', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Description"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Image URL</label>
                    <input
                        type="url"
                        value={data.image || ''}
                        onChange={(e) => updateSectionContent('digital_campus', 'image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://..."
                    />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Tech Features ({features.length})</label>
                    {features.map((feat, index) => (
                        <div key={feat._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <select
                                    value={feat.icon || 'Wifi'}
                                    onChange={(e) => updateFeature(feat._id, 'icon', e.target.value)}
                                    className="px-2 py-1 border border-slate-200 rounded text-xs"
                                >
                                    {digitalIconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <button onClick={() => removeFeature(feat._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={feat.title || ''}
                                onChange={(e) => updateFeature(feat._id, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Feature Title"
                            />
                            <input
                                type="text"
                                value={feat.desc || ''}
                                onChange={(e) => updateFeature(feat._id, 'desc', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Description"
                            />
                        </div>
                    ))}
                    <button onClick={addFeature} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Feature
                    </button>
                </div>
            </>
        );
    };

    // Safety Security Editor
    const renderSafetyEditor = () => {
        const data = getSectionData('safety_security');
        const features = data.features || [];

        const updateFeature = (id, field, value) => {
            const newFeatures = features.map(f => f._id === id ? { ...f, [field]: value } : f);
            updateSectionContent('safety_security', 'features', newFeatures);
        };

        const addFeature = () => {
            const newFeatures = [...features, { _id: generateId(), icon: 'Video', title: '', desc: '' }];
            updateSectionContent('safety_security', 'features', newFeatures);
        };

        const removeFeature = (id) => {
            const newFeatures = features.filter(f => f._id !== id);
            updateSectionContent('safety_security', 'features', newFeatures);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('safety_security', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Safety First"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('safety_security', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Secure Learning Environment"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        rows="2"
                        value={data.description || ''}
                        onChange={(e) => updateSectionContent('safety_security', 'description', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                        placeholder="Description"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Image URL</label>
                    <input
                        type="url"
                        value={data.image || ''}
                        onChange={(e) => updateSectionContent('safety_security', 'image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Badge Title</label>
                        <input
                            type="text"
                            value={data.badge?.title || ''}
                            onChange={(e) => updateSectionContent('safety_security', 'badge', { ...data.badge, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., Certified Safe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Badge Subtitle</label>
                        <input
                            type="text"
                            value={data.badge?.subtitle || ''}
                            onChange={(e) => updateSectionContent('safety_security', 'badge', { ...data.badge, subtitle: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., ISO 9001 Compliant"
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Safety Features ({features.length})</label>
                    {features.map((feat, index) => (
                        <div key={feat._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <select
                                    value={feat.icon || 'Video'}
                                    onChange={(e) => updateFeature(feat._id, 'icon', e.target.value)}
                                    className="px-2 py-1 border border-slate-200 rounded text-xs"
                                >
                                    {safetyIconOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <button onClick={() => removeFeature(feat._id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={feat.title || ''}
                                onChange={(e) => updateFeature(feat._id, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Feature Title"
                            />
                            <input
                                type="text"
                                value={feat.desc || ''}
                                onChange={(e) => updateFeature(feat._id, 'desc', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Description"
                            />
                        </div>
                    ))}
                    <button onClick={addFeature} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        <Plus size={16} /> Add Feature
                    </button>
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'hero': return renderHeroEditor();
            case 'facility_grid': return renderFacilityGridEditor();
            case 'eco_initiatives': return renderEcoEditor();
            case 'digital_campus': return renderDigitalCampusEditor();
            case 'safety_security': return renderSafetyEditor();
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
            ['facilities', 'cards', 'stats', 'features'].forEach(key => {
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

    const sectionOrder = ['hero', 'facility_grid', 'eco_initiatives', 'digital_campus', 'safety_security'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit Facilities Page</h2>
                <p className="text-slate-500">Manage content for the facilities page sections.</p>
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

export default FacilitiesEditor;
