import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Type, Image as ImageIcon, AlignLeft, Clock, Users,
    ChevronDown, ChevronUp, Loader2, Save, Plus, Trash2, Target, Eye, Camera
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
    mission_vision: Target,
    timeline: Clock,
    leadership: Users,
    campus_gallery: Camera
};

const sectionTitles = {
    hero: 'Hero Banner',
    mission_vision: 'Mission & Vision',
    timeline: 'History Timeline',
    leadership: 'Leadership Team',
    campus_gallery: 'Life on Campus'
};

const sectionBadges = {
    hero: 'Banner',
    mission_vision: '2 Cards',
    timeline: 'Timeline',
    leadership: 'Team',
    campus_gallery: 'Gallery'
};

// Generate unique ID for new items
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const AboutEditor = ({ content, onUpdate }) => {
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
            // Parse JSON string if needed
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

            // Add IDs to timeline items (handle both 'items' and 'events' array names)
            const timelineArray = sectionContent.items || sectionContent.events;
            if (timelineArray && Array.isArray(timelineArray)) {
                sectionContent = {
                    ...sectionContent,
                    items: timelineArray.map(item => ({
                        ...item,
                        _id: item._id || generateId()
                    }))
                };
                // Remove 'events' if it exists (normalize to 'items')
                delete sectionContent.events;
            }

            // Add IDs to leadership members
            if (sectionContent.members && Array.isArray(sectionContent.members)) {
                sectionContent = {
                    ...sectionContent,
                    members: sectionContent.members.map(member => ({
                        ...member,
                        _id: member._id || generateId()
                    }))
                };
            }

            // Add IDs to gallery images
            if (sectionContent.images && Array.isArray(sectionContent.images)) {
                sectionContent = {
                    ...sectionContent,
                    images: sectionContent.images.map(img => ({
                        ...img,
                        _id: img._id || generateId()
                    }))
                };
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

    // Debounced update to parent - only after initialization
    useEffect(() => {
        if (!isInitialized || !onUpdate || Object.keys(localContent).length === 0) return;

        // Clear previous timeout
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        // Debounce updates
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

    const updateNestedContent = useCallback((sectionKey, path, value) => {
        const keys = path.split('.');
        setLocalContent(prev => {
            const section = prev[sectionKey] || {};
            const content = { ...section.content };
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
                        placeholder="e.g., Since 1985"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('hero', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Our Legacy"
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

    // Mission & Vision Editor
    const renderMissionVisionEditor = () => {
        const data = getSectionData('mission_vision');
        return (
            <>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Target size={16} className="text-primary" /> Mission</h4>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={data.mission?.title || ''}
                            onChange={(e) => updateNestedContent('mission_vision', 'mission.title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            placeholder="Mission Title"
                        />
                        <textarea
                            rows="3"
                            value={data.mission?.description || ''}
                            onChange={(e) => updateNestedContent('mission_vision', 'mission.description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                            placeholder="Mission description"
                        />
                    </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Eye size={16} className="text-amber-600" /> Vision</h4>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={data.vision?.title || ''}
                            onChange={(e) => updateNestedContent('mission_vision', 'vision.title', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            placeholder="Vision Title"
                        />
                        <textarea
                            rows="3"
                            value={data.vision?.description || ''}
                            onChange={(e) => updateNestedContent('mission_vision', 'vision.description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                            placeholder="Vision description"
                        />
                    </div>
                </div>
            </>
        );
    };

    // Timeline Editor
    const renderTimelineEditor = () => {
        const data = getSectionData('timeline');
        // Handle both 'items' and 'events' array names (legacy vs new)
        const items = data.items || data.events || [];

        const updateItem = (id, field, value) => {
            const newItems = items.map(item =>
                item._id === id ? { ...item, [field]: value } : item
            );
            updateSectionContent('timeline', 'items', newItems);
            // Also clear 'events' if it exists to migrate to 'items'
            if (data.events) {
                updateSectionContent('timeline', 'events', undefined);
            }
        };

        const removeItem = (id) => {
            const newItems = items.filter(item => item._id !== id);
            updateSectionContent('timeline', 'items', newItems);
        };

        const addItem = () => {
            const newItems = [...items, { _id: generateId(), year: '', title: '', description: '' }];
            updateSectionContent('timeline', 'items', newItems);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('timeline', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Our Journey"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('timeline', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Through the Decades"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Timeline Items ({items.length})</label>
                    {items.map((item, index) => (
                        <div key={item._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Year {index + 1}</span>
                                <button
                                    onClick={() => removeItem(item._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <input
                                    type="text"
                                    value={item.year || ''}
                                    onChange={(e) => updateItem(item._id, 'year', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                                    placeholder="Year"
                                />
                                <input
                                    type="text"
                                    value={item.title || ''}
                                    onChange={(e) => updateItem(item._id, 'title', e.target.value)}
                                    className="col-span-3 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Title"
                                />
                            </div>
                            <textarea
                                rows="2"
                                value={item.description || ''}
                                onChange={(e) => updateItem(item._id, 'description', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                                placeholder="Description"
                            />
                        </div>
                    ))}
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                    >
                        <Plus size={16} /> Add Timeline Item
                    </button>
                </div>
            </>
        );
    };

    // Leadership Editor
    const renderLeadershipEditor = () => {
        const data = getSectionData('leadership');
        const members = data.members || [];

        const updateMember = (id, field, value) => {
            const newMembers = members.map(member =>
                member._id === id ? { ...member, [field]: value } : member
            );
            updateSectionContent('leadership', 'members', newMembers);
        };

        const removeMember = (id) => {
            const newMembers = members.filter(member => member._id !== id);
            updateSectionContent('leadership', 'members', newMembers);
        };

        const addMember = () => {
            const newMembers = [...members, { _id: generateId(), name: '', role: '', image: '' }];
            updateSectionContent('leadership', 'members', newMembers);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Tagline</label>
                    <input
                        type="text"
                        value={data.tagline || ''}
                        onChange={(e) => updateSectionContent('leadership', 'tagline', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Leadership"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('leadership', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Guiding Our Path"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Team Members ({members.length})</label>
                    {members.map((member, index) => (
                        <div key={member._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Member {index + 1}</span>
                                <button
                                    onClick={() => removeMember(member._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={member.name || ''}
                                    onChange={(e) => updateMember(member._id, 'name', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Name"
                                />
                                <input
                                    type="text"
                                    value={member.role || ''}
                                    onChange={(e) => updateMember(member._id, 'role', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Role"
                                />
                            </div>
                            <input
                                type="url"
                                value={member.image || ''}
                                onChange={(e) => updateMember(member._id, 'image', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                placeholder="Image URL"
                            />
                            {member.image && (
                                <img src={member.image} alt={member.name} className="w-16 h-16 rounded-full object-cover" onError={(e) => { e.target.src = 'https://placehold.co/100x100/6d0b1a/white?text=?' }} />
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addMember}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                    >
                        <Plus size={16} /> Add Team Member
                    </button>
                </div>
            </>
        );
    };

    // Campus Gallery Editor
    const renderCampusGalleryEditor = () => {
        const data = getSectionData('campus_gallery');
        const images = data.images || [];

        const updateImage = (id, field, value) => {
            const newImages = images.map(img =>
                img._id === id ? { ...img, [field]: value } : img
            );
            updateSectionContent('campus_gallery', 'images', newImages);
        };

        const removeImage = (id) => {
            const newImages = images.filter(img => img._id !== id);
            updateSectionContent('campus_gallery', 'images', newImages);
        };

        const addImage = () => {
            const newImages = [...images, { _id: generateId(), label: '', url: '' }];
            updateSectionContent('campus_gallery', 'images', newImages);
        };

        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input
                        type="text"
                        value={data.title || ''}
                        onChange={(e) => updateSectionContent('campus_gallery', 'title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., Life on Campus"
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Gallery Images ({images.length})</label>
                    {images.map((img, index) => (
                        <div key={img._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500 uppercase">Image {index + 1}</span>
                                <button
                                    onClick={() => removeImage(img._id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={img.label || ''}
                                    onChange={(e) => updateImage(img._id, 'label', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Label"
                                />
                                <input
                                    type="url"
                                    value={img.url || ''}
                                    onChange={(e) => updateImage(img._id, 'url', e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                    placeholder="Image URL"
                                />
                            </div>
                            {img.url && (
                                <img src={img.url} alt={img.label} className="w-full h-20 rounded-lg object-cover" onError={(e) => { e.target.src = 'https://placehold.co/400x100/f1f5f9/94a3b8?text=Campus' }} />
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addImage}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                    >
                        <Plus size={16} /> Add Gallery Image
                    </button>
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'hero': return renderHeroEditor();
            case 'mission_vision': return renderMissionVisionEditor();
            case 'timeline': return renderTimelineEditor();
            case 'leadership': return renderLeadershipEditor();
            case 'campus_gallery': return renderCampusGalleryEditor();
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
            if (contentToSave.items) {
                contentToSave.items = contentToSave.items.map(({ _id, ...rest }) => rest);
            }
            if (contentToSave.members) {
                contentToSave.members = contentToSave.members.map(({ _id, ...rest }) => rest);
            }
            if (contentToSave.images) {
                contentToSave.images = contentToSave.images.map(({ _id, ...rest }) => rest);
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

    const sectionOrder = ['hero', 'mission_vision', 'timeline', 'leadership', 'campus_gallery'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit About Page</h2>
                <p className="text-slate-500">Manage content for the about page sections.</p>
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

export default AboutEditor;
