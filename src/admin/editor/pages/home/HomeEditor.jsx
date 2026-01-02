import React, { useState, useEffect } from 'react';
import {
    Type, Image, AlignLeft, GraduationCap, Building2, Newspaper,
    ChevronDown, ChevronUp, Loader2, Save, Plus, Trash2, Globe, Users
} from 'lucide-react';
import { adminFetch } from '../../../utils/adminApi';

// Collapsible Section Component
const Section = ({ title, icon: Icon, isOpen, onToggle, badge, children, onSave, saving, sectionKey }) => (
    <div className={`bg-white rounded-xl border transition-all duration-200 ${isOpen ? 'border-amber-200 shadow-md ring-1 ring-amber-100' : 'border-slate-200 shadow-sm'}`}>
        <div
            onClick={onToggle}
            className={`px-6 py-4 flex items-center justify-between cursor-pointer select-none ${isOpen ? 'bg-amber-50/50 border-b border-amber-100' : 'hover:bg-slate-50'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isOpen ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={18} />
                </div>
                <h3 className={`font-bold ${isOpen ? 'text-amber-900' : 'text-slate-700'}`}>{title}</h3>
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

// Section icons mapping
const sectionIcons = {
    hero: Type,
    founder_message: AlignLeft,
    features: GraduationCap,
    academies: Building2,
    news: Newspaper
};

const sectionTitles = {
    hero: 'Hero Section',
    founder_message: "Principal's Message",
    features: 'Key Features',
    academies: 'Academic Programs',
    news: 'News & Events'
};

const sectionBadges = {
    hero: 'Top Fold',
    founder_message: null,
    features: '3 Items',
    academies: '5 Programs',
    news: 'Auto-fetch'
};

const HomeEditor = ({ content, onUpdate }) => {
    const [openSection, setOpenSection] = useState('hero');
    const [savingSection, setSavingSection] = useState(null);
    const [localContent, setLocalContent] = useState({});
    const isInitializedRef = React.useRef(false);

    // Transform array content into object keyed by section_key (only on initial load)
    useEffect(() => {
        if (content && Array.isArray(content) && !isInitializedRef.current) {
            const contentMap = {};
            content.forEach(section => {
                contentMap[section.section_key] = {
                    id: section.id,
                    content: section.content,
                    order_index: section.order_index,
                    is_active: section.is_active
                };
            });
            setLocalContent(contentMap);
            isInitializedRef.current = true;
        }
    }, [content]);

    // Propagate local changes back to parent for live preview
    useEffect(() => {
        if (isInitializedRef.current && Object.keys(localContent).length > 0 && onUpdate) {
            // Convert localContent back to array format
            const updatedArray = Object.entries(localContent).map(([key, val]) => ({
                section_key: key,
                id: val.id,
                content: val.content,
                order_index: val.order_index,
                is_active: val.is_active
            }));
            onUpdate(updatedArray);
        }
    }, [localContent]);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const updateSectionContent = (sectionKey, field, value) => {
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
    };

    const updateNestedContent = (sectionKey, path, value) => {
        setLocalContent(prev => {
            const section = { ...prev[sectionKey] };
            const content = { ...section.content };

            // Handle nested path like 'button.text' or 'founder.name'
            const keys = path.split('.');
            let current = content;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;

            return {
                ...prev,
                [sectionKey]: { ...section, content }
            };
        });
    };

    const getSectionData = (key) => localContent[key]?.content || {};

    // Render Hero Section Editor
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
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all"
                        placeholder="e.g., Welcome to EduNet"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Main Headline</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all"
                        placeholder="e.g., Inspiring Excellence in Education"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subtitle</label>
                    <textarea
                        rows="3"
                        value={data.subtitle || ''}
                        onChange={(e) => updateSectionContent('hero', 'subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all resize-none"
                        placeholder="A brief description..."
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">CTA Button Text</label>
                        <input
                            type="text"
                            value={data.button?.text || ''}
                            onChange={(e) => updateNestedContent('hero', 'button.text', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., Explore Campus"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">CTA Link</label>
                        <input
                            type="text"
                            value={data.button?.url || ''}
                            onChange={(e) => updateNestedContent('hero', 'button.url', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., /about"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hero Image URL</label>
                    <input
                        type="url"
                        value={data.image || ''}
                        onChange={(e) => updateSectionContent('hero', 'image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://example.com/image.jpg or /hero-student.png"
                    />
                    {data.image && (
                        <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                                src={data.image}
                                alt="Hero preview"
                                className="w-full h-32 object-cover"
                                onError={(e) => { e.target.src = 'https://placehold.co/800x400/f1f5f9/94a3b8?text=Image+Not+Found'; }}
                            />
                        </div>
                    )}
                </div>

                {/* Badge Section */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-3">Floating Badge (Bottom Left)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Rank Text</label>
                            <input
                                type="text"
                                value={data.badge?.rank || ''}
                                onChange={(e) => updateNestedContent('hero', 'badge.rank', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="e.g., #1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Badge Text</label>
                            <input
                                type="text"
                                value={data.badge?.text || ''}
                                onChange={(e) => updateNestedContent('hero', 'badge.text', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="e.g., Best in Boston"
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Render Founder Message Editor
    const renderFounderEditor = () => {
        const data = getSectionData('founder_message');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tagline (Small Text Above Title)</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('founder_message', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Our History"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('founder_message', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Years Badge Number</label>
                        <input
                            type="text"
                            value={data.years_badge || ''}
                            onChange={(e) => updateSectionContent('founder_message', 'years_badge', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., 50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Years Badge Label</label>
                        <input
                            type="text"
                            value={data.years_label || ''}
                            onChange={(e) => updateSectionContent('founder_message', 'years_label', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                            placeholder="e.g., Years"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        rows="4"
                        value={data.description || ''}
                        onChange={(e) => updateSectionContent('founder_message', 'description', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Quote</label>
                    <textarea
                        rows="3"
                        value={data.quote || ''}
                        onChange={(e) => updateSectionContent('founder_message', 'quote', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none italic"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Founder Name</label>
                        <input
                            type="text"
                            value={data.founder?.name || ''}
                            onChange={(e) => updateNestedContent('founder_message', 'founder.name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Founder Role</label>
                        <input
                            type="text"
                            value={data.founder?.role || ''}
                            onChange={(e) => updateNestedContent('founder_message', 'founder.role', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Founder Photo URL</label>
                    <input
                        type="url"
                        value={data.founder?.image || ''}
                        onChange={(e) => updateNestedContent('founder_message', 'founder.image', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://example.com/founder.jpg"
                    />
                    {data.founder?.image && (
                        <div className="mt-3 flex items-center gap-4">
                            <img
                                src={data.founder.image}
                                alt="Founder"
                                className="w-16 h-16 rounded-full object-cover border-2 border-amber-200"
                                onError={(e) => { e.target.src = 'https://placehold.co/100x100/f1f5f9/94a3b8?text=?'; }}
                            />
                            <span className="text-xs text-slate-500">Founder photo preview</span>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Main Section Image URL</label>
                    <input
                        type="url"
                        value={data.images?.main || ''}
                        onChange={(e) => updateNestedContent('founder_message', 'images.main', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="https://example.com/school.jpg"
                    />
                    {data.images?.main && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                            <img
                                src={data.images.main}
                                alt="Section preview"
                                className="w-full h-32 object-cover"
                                onError={(e) => { e.target.src = 'https://placehold.co/800x400/f1f5f9/94a3b8?text=Image+Not+Found'; }}
                            />
                        </div>
                    )}
                </div>
            </>
        );
    };

    // Render Features Editor
    const renderFeaturesEditor = () => {
        const data = getSectionData('features');
        const features = data.features || [];

        // Icon options matching the map in Features.jsx
        const iconOptions = ['GraduationCap', 'Globe', 'Users', 'Trophy', 'BookOpen'];

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('features', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('features', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Features ({features.length})</label>
                    {features.map((feature, index) => (
                        <div key={feature.id || index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Feature {index + 1}</span>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={feature.icon || 'GraduationCap'}
                                        onChange={(e) => {
                                            const newFeatures = [...features];
                                            newFeatures[index] = { ...newFeatures[index], icon: e.target.value };
                                            updateSectionContent('features', 'features', newFeatures);
                                        }}
                                        className="text-xs bg-white border border-slate-200 rounded px-2 py-1"
                                    >
                                        {iconOptions.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={feature.title || ''}
                                onChange={(e) => {
                                    const newFeatures = [...features];
                                    newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                                    updateSectionContent('features', 'features', newFeatures);
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Feature title"
                            />
                            <textarea
                                rows="2"
                                value={feature.description || ''}
                                onChange={(e) => {
                                    const newFeatures = [...features];
                                    newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                                    updateSectionContent('features', 'features', newFeatures);
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                placeholder="Feature description"
                            />
                        </div>
                    ))}
                </div>

                {/* Button */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Button Text</label>
                    <input
                        type="text"
                        value={data.button?.text || ''}
                        onChange={(e) => updateNestedContent('features', 'button.text', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Discover More"
                    />
                </div>

                {/* Stats */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Bottom Stats</label>
                    {(data.stats || []).map((stat, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <select
                                value={stat.icon || 'Trophy'}
                                onChange={(e) => {
                                    const newStats = [...(data.stats || [])];
                                    newStats[index] = { ...newStats[index], icon: e.target.value };
                                    updateSectionContent('features', 'stats', newStats);
                                }}
                                className="w-24 text-xs bg-white border border-slate-200 rounded px-2 py-2"
                            >
                                {iconOptions.map(icon => (
                                    <option key={icon} value={icon}>{icon}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={stat.value || ''}
                                onChange={(e) => {
                                    const newStats = [...(data.stats || [])];
                                    newStats[index] = { ...newStats[index], value: e.target.value };
                                    updateSectionContent('features', 'stats', newStats);
                                }}
                                className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                                placeholder="e.g. 50+"
                            />
                            <input
                                type="text"
                                value={stat.text || ''}
                                onChange={(e) => {
                                    const newStats = [...(data.stats || [])];
                                    newStats[index] = { ...newStats[index], text: e.target.value };
                                    updateSectionContent('features', 'stats', newStats);
                                }}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Label"
                            />
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // Render Academies Editor
    const renderAcademiesEditor = () => {
        const data = getSectionData('academies');
        const academies = data.academies || [];

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('academies', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('academies', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Programs ({academies.length})</label>
                    {academies.map((academy, index) => (
                        <div key={academy.id || index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-lg font-bold text-amber-600">{academy.id}.</span>
                                <input
                                    type="text"
                                    value={academy.name || ''}
                                    onChange={(e) => {
                                        const newAcademies = [...academies];
                                        newAcademies[index] = { ...newAcademies[index], name: e.target.value };
                                        updateSectionContent('academies', 'academies', newAcademies);
                                    }}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
                                />
                            </div>
                            <textarea
                                rows="2"
                                value={academy.description || ''}
                                onChange={(e) => {
                                    const newAcademies = [...academies];
                                    newAcademies[index] = { ...newAcademies[index], description: e.target.value };
                                    updateSectionContent('academies', 'academies', newAcademies);
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                placeholder="Description"
                            />
                            <div className="flex items-center gap-3 mt-2">
                                <input
                                    type="url"
                                    value={academy.image || ''}
                                    onChange={(e) => {
                                        const newAcademies = [...academies];
                                        newAcademies[index] = { ...newAcademies[index], image: e.target.value };
                                        updateSectionContent('academies', 'academies', newAcademies);
                                    }}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Image URL (https://...)"
                                />
                                {academy.image && (
                                    <img
                                        src={academy.image}
                                        alt={academy.name}
                                        className="w-12 h-12 rounded object-cover border border-slate-200"
                                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/f1f5f9/94a3b8?text=?'; }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // Render News Editor
    const renderNewsEditor = () => {
        const data = getSectionData('news');
        const items = data.items || [];

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('news', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={!!data.link}
                            onChange={(e) => updateSectionContent('news', 'link', e.target.checked ? '/news' : null)}
                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-slate-700">Show "View All Updates" Link</span>
                    </label>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">News Items ({items.length})</label>
                    {items.map((item, index) => (
                        <div key={item.id || index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={item.date || ''}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[index] = { ...newItems[index], date: e.target.value };
                                        updateSectionContent('news', 'items', newItems);
                                    }}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-center"
                                    placeholder="Day"
                                />
                                <input
                                    type="text"
                                    value={item.month || ''}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[index] = { ...newItems[index], month: e.target.value };
                                        updateSectionContent('news', 'items', newItems);
                                    }}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-center"
                                    placeholder="Month"
                                />
                                <input
                                    type="text"
                                    value={item.subtitle || ''}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[index] = { ...newItems[index], subtitle: e.target.value };
                                        updateSectionContent('news', 'items', newItems);
                                    }}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Category"
                                />
                            </div>
                            <input
                                type="text"
                                value={item.title || ''}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index] = { ...newItems[index], title: e.target.value };
                                    updateSectionContent('news', 'items', newItems);
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
                                placeholder="Title"
                            />
                            <div className="flex items-center gap-3">
                                <input
                                    type="url"
                                    value={item.image || ''}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        newItems[index] = { ...newItems[index], image: e.target.value };
                                        updateSectionContent('news', 'items', newItems);
                                    }}
                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Image URL (https://...)"
                                />
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt="News preview"
                                        className="w-12 h-12 rounded object-cover border border-slate-200"
                                        onError={(e) => { e.target.src = 'https://placehold.co/100x100/f1f5f9/94a3b8?text=?'; }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'hero': return renderHeroEditor();
            case 'founder_message': return renderFounderEditor();
            case 'features': return renderFeaturesEditor();
            case 'academies': return renderAcademiesEditor();
            case 'news': return renderNewsEditor();
            default: return <div className="p-4 text-slate-500 text-center">Editor not available for this section.</div>;
        }
    };

    const handleSaveSection = async (sectionKey) => {
        const sectionData = localContent[sectionKey];
        if (!sectionData || !sectionData.id) return;

        setSavingSection(sectionKey);
        try {
            const response = await adminFetch(`/site-content/sections/${sectionData.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    content: sectionData.content,
                    order_index: sectionData.order_index,
                    is_active: sectionData.is_active
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save section');
            }

            // Update parent if needed
            if (onUpdate) {
                const updatedContent = content.map(s =>
                    s.section_key === sectionKey
                        ? { ...s, content: sectionData.content }
                        : s
                );
                onUpdate(updatedContent);
            }
        } catch (error) {
            console.error('Failed to save section:', error);
            alert('Failed to save section. Please try again.');
        } finally {
            setTimeout(() => setSavingSection(null), 500);
        }
    };

    // Get section order for display
    const sectionOrder = ['hero', 'founder_message', 'features', 'academies', 'news'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit Homepage</h2>
                <p className="text-slate-500">Manage content for the main landing page sections.</p>
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

export default HomeEditor;
