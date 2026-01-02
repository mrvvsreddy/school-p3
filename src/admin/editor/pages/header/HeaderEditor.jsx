import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Type, ChevronDown, Plus, Trash2, Loader2, Save, PenTool, Navigation } from 'lucide-react';
import adminFetch from '../../../utils/adminApi';

const Section = ({ title, icon: Icon, badge, isOpen, onToggle, children, onSave, saving, sectionKey }) => (
    <div className={`bg-white rounded-xl border transition-all duration-300 ${isOpen ? 'border-primary/30 shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}>
        <button className="w-full flex items-center justify-between p-5 text-left" onClick={onToggle}>
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

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const HeaderEditor = ({ content, onUpdate }) => {
    const [localContent, setLocalContent] = useState({});
    const [openSection, setOpenSection] = useState(null);
    const [savingSection, setSavingSection] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const updateTimeoutRef = useRef(null);

    useEffect(() => {
        if (!content || content.length === 0) return;

        const contentMap = {};
        content.forEach(section => {
            let sectionContent = section.content;
            if (typeof sectionContent === 'string') {
                try { sectionContent = JSON.parse(sectionContent); } catch { sectionContent = {}; }
            }
            sectionContent = sectionContent || {};

            if (sectionContent.links && Array.isArray(sectionContent.links)) {
                sectionContent.links = sectionContent.links.map(item => ({
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

    useEffect(() => {
        if (!isInitialized || !onUpdate || Object.keys(localContent).length === 0) return;

        if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);

        updateTimeoutRef.current = setTimeout(() => {
            const updatedContent = content.map(section => ({
                ...section,
                content: localContent[section.section_key]?.content || section.content
            }));
            onUpdate(updatedContent);
        }, 300);

        return () => { if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current); };
    }, [localContent, isInitialized]);

    const getSectionData = useCallback((sectionKey) => localContent[sectionKey]?.content || {}, [localContent]);

    const updateSectionContent = useCallback((sectionKey, field, value) => {
        setLocalContent(prev => ({
            ...prev,
            [sectionKey]: {
                ...prev[sectionKey],
                content: { ...prev[sectionKey]?.content, [field]: value }
            }
        }));
    }, []);

    const toggleSection = (sectionKey) => setOpenSection(prev => prev === sectionKey ? null : sectionKey);

    const renderBrandEditor = () => {
        const data = getSectionData('brand');
        return (
            <>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Logo Text</label>
                    <input
                        type="text"
                        value={data.logo_text || ''}
                        onChange={(e) => updateSectionContent('brand', 'logo_text', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., EduNet"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Logo Accent (suffix)</label>
                    <input
                        type="text"
                        value={data.logo_accent || ''}
                        onChange={(e) => updateSectionContent('brand', 'logo_accent', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"
                        placeholder="e.g., ."
                    />
                </div>
            </>
        );
    };

    const renderNavigationEditor = () => {
        const data = getSectionData('navigation');
        const links = data.links || [];

        const updateLink = (id, field, value) => {
            const newLinks = links.map(l => l._id === id ? { ...l, [field]: value } : l);
            updateSectionContent('navigation', 'links', newLinks);
        };

        const addLink = () => {
            const newLinks = [...links, { _id: generateId(), name: '', path: '/' }];
            updateSectionContent('navigation', 'links', newLinks);
        };

        const removeLink = (id) => {
            const newLinks = links.filter(l => l._id !== id);
            updateSectionContent('navigation', 'links', newLinks);
        };

        return (
            <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">Navigation Links ({links.length})</label>
                {links.map((link) => (
                    <div key={link._id} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={link.name || ''}
                            onChange={(e) => updateLink(link._id, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            placeholder="Link Name"
                        />
                        <input
                            type="text"
                            value={link.path || ''}
                            onChange={(e) => updateLink(link._id, 'path', e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            placeholder="Path (e.g., /about)"
                        />
                        <button onClick={() => removeLink(link._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                <button onClick={addLink} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                    <Plus size={16} /> Add Link
                </button>
            </div>
        );
    };

    const handleSaveSection = async (sectionKey) => {
        const sectionData = localContent[sectionKey];
        if (!sectionData?.id) return;

        setSavingSection(sectionKey);
        try {
            let contentToSave = { ...sectionData.content };
            if (contentToSave.links) {
                contentToSave.links = contentToSave.links.map(({ _id, ...rest }) => rest);
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

    const sectionOrder = ['brand', 'navigation'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit Header</h2>
                <p className="text-slate-500">Manage logo and navigation links.</p>
            </div>

            {availableSections.map((sectionKey) => (
                <Section
                    key={sectionKey}
                    title={sectionKey === 'brand' ? 'Brand / Logo' : 'Navigation Menu'}
                    icon={sectionKey === 'brand' ? PenTool : Navigation}
                    isOpen={openSection === sectionKey}
                    onToggle={() => toggleSection(sectionKey)}
                    badge={sectionKey === 'navigation' ? `${(getSectionData('navigation').links || []).length} Links` : 'Logo'}
                    onSave={handleSaveSection}
                    saving={savingSection === sectionKey}
                    sectionKey={sectionKey}
                >
                    {sectionKey === 'brand' ? renderBrandEditor() : renderNavigationEditor()}
                </Section>
            ))}
        </div>
    );
};

export default HeaderEditor;
