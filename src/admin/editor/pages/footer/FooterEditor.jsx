import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Type, ChevronDown, Plus, Trash2, Loader2, Save,
    Building2, Link2, Phone, Copyright
} from 'lucide-react';
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
                        Save
                    </button>
                )}
                <div className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={20} className="text-slate-400" />
                </div>
            </div>
        </button>
        {isOpen && <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-5">{children}</div>}
    </div>
);

const sectionConfig = {
    brand: { title: 'Brand Info', icon: Building2, badge: 'Logo & Social' },
    quick_links: { title: 'Quick Links', icon: Link2, badge: 'Column 1' },
    programs: { title: 'Programs', icon: Link2, badge: 'Column 2' },
    contact_info: { title: 'Contact Info', icon: Phone, badge: 'Address' },
    copyright: { title: 'Copyright', icon: Copyright, badge: 'Bottom Bar' }
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const FooterEditor = ({ content, onUpdate }) => {
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

            ['social_links', 'links'].forEach(key => {
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

    // Brand Editor
    const renderBrandEditor = () => {
        const data = getSectionData('brand');
        const socialLinks = data.social_links || [];

        const updateSocial = (id, field, value) => {
            const newLinks = socialLinks.map(s => s._id === id ? { ...s, [field]: value } : s);
            updateSectionContent('brand', 'social_links', newLinks);
        };

        const addSocial = () => updateSectionContent('brand', 'social_links', [...socialLinks, { _id: generateId(), label: '', url: '#' }]);
        const removeSocial = (id) => updateSectionContent('brand', 'social_links', socialLinks.filter(s => s._id !== id));

        return (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Brand Name</label>
                        <input type="text" value={data.name || ''} onChange={(e) => updateSectionContent('brand', 'name', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Accent</label>
                        <input type="text" value={data.accent || ''} onChange={(e) => updateSectionContent('brand', 'accent', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" placeholder="." />
                    </div>
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea rows="2" value={data.description || ''} onChange={(e) => updateSectionContent('brand', 'description', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Social Links ({socialLinks.length})</label>
                    {socialLinks.map((link) => (
                        <div key={link._id} className="flex items-center gap-2">
                            <input type="text" value={link.label || ''} onChange={(e) => updateSocial(link._id, 'label', e.target.value)} className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Label" />
                            <input type="text" value={link.url || ''} onChange={(e) => updateSocial(link._id, 'url', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="URL" />
                            <button onClick={() => removeSocial(link._id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <button onClick={addSocial} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"><Plus size={16} /> Add Social</button>
                </div>
            </>
        );
    };

    // Links Column Editor (Quick Links / Programs)
    const renderLinksEditor = (sectionKey) => {
        const data = getSectionData(sectionKey);
        const links = data.links || [];

        const updateLink = (id, field, value) => {
            const newLinks = links.map(l => l._id === id ? { ...l, [field]: value } : l);
            updateSectionContent(sectionKey, 'links', newLinks);
        };

        const addLink = () => updateSectionContent(sectionKey, 'links', [...links, { _id: generateId(), label: '', url: '/' }]);
        const removeLink = (id) => updateSectionContent(sectionKey, 'links', links.filter(l => l._id !== id));

        return (
            <>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Column Title</label>
                    <input type="text" value={data.title || ''} onChange={(e) => updateSectionContent(sectionKey, 'title', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Links ({links.length})</label>
                    {links.map((link) => (
                        <div key={link._id} className="flex items-center gap-2">
                            <input type="text" value={link.label || ''} onChange={(e) => updateLink(link._id, 'label', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Label" />
                            <input type="text" value={link.url || ''} onChange={(e) => updateLink(link._id, 'url', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="URL" />
                            <button onClick={() => removeLink(link._id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <button onClick={addLink} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"><Plus size={16} /> Add Link</button>
                </div>
            </>
        );
    };

    // Contact Info Editor
    const renderContactEditor = () => {
        const data = getSectionData('contact_info');
        return (
            <>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Section Title</label>
                    <input type="text" value={data.title || ''} onChange={(e) => updateSectionContent('contact_info', 'title', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                    <input type="text" value={data.address || ''} onChange={(e) => updateSectionContent('contact_info', 'address', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                        <input type="text" value={data.phone || ''} onChange={(e) => updateSectionContent('contact_info', 'phone', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div><label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <input type="text" value={data.email || ''} onChange={(e) => updateSectionContent('contact_info', 'email', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" />
                    </div>
                </div>
            </>
        );
    };

    // Copyright Editor
    const renderCopyrightEditor = () => {
        const data = getSectionData('copyright');
        const links = data.links || [];

        const updateLink = (id, field, value) => {
            const newLinks = links.map(l => l._id === id ? { ...l, [field]: value } : l);
            updateSectionContent('copyright', 'links', newLinks);
        };

        const addLink = () => updateSectionContent('copyright', 'links', [...links, { _id: generateId(), label: '', url: '#' }]);
        const removeLink = (id) => updateSectionContent('copyright', 'links', links.filter(l => l._id !== id));

        return (
            <>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Copyright Text</label>
                    <input type="text" value={data.text || ''} onChange={(e) => updateSectionContent('copyright', 'text', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm" placeholder="Use {year} for current year" />
                </div>
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Footer Links ({links.length})</label>
                    {links.map((link) => (
                        <div key={link._id} className="flex items-center gap-2">
                            <input type="text" value={link.label || ''} onChange={(e) => updateLink(link._id, 'label', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Label" />
                            <input type="text" value={link.url || ''} onChange={(e) => updateLink(link._id, 'url', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="URL" />
                            <button onClick={() => removeLink(link._id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                        </div>
                    ))}
                    <button onClick={addLink} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"><Plus size={16} /> Add Link</button>
                </div>
            </>
        );
    };

    const renderSectionEditor = (sectionKey) => {
        switch (sectionKey) {
            case 'brand': return renderBrandEditor();
            case 'quick_links': return renderLinksEditor('quick_links');
            case 'programs': return renderLinksEditor('programs');
            case 'contact_info': return renderContactEditor();
            case 'copyright': return renderCopyrightEditor();
            default: return null;
        }
    };

    const handleSaveSection = async (sectionKey) => {
        const sectionData = localContent[sectionKey];
        if (!sectionData?.id) return;

        setSavingSection(sectionKey);
        try {
            let contentToSave = { ...sectionData.content };
            ['social_links', 'links'].forEach(key => {
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

    const sectionOrder = ['brand', 'quick_links', 'programs', 'contact_info', 'copyright'];
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
                <h2 className="text-2xl font-bold text-slate-800">Edit Footer</h2>
                <p className="text-slate-500">Manage footer content sections.</p>
            </div>

            {availableSections.map((sectionKey) => {
                const config = sectionConfig[sectionKey] || { title: sectionKey, icon: Type, badge: '' };
                return (
                    <Section
                        key={sectionKey}
                        title={config.title}
                        icon={config.icon}
                        isOpen={openSection === sectionKey}
                        onToggle={() => toggleSection(sectionKey)}
                        badge={config.badge}
                        onSave={handleSaveSection}
                        saving={savingSection === sectionKey}
                        sectionKey={sectionKey}
                    >
                        {renderSectionEditor(sectionKey)}
                    </Section>
                );
            })}
        </div>
    );
};

export default FooterEditor;
