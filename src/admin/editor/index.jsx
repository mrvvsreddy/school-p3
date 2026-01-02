import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Globe,
    Home,
    Info,
    GraduationCap,
    BookOpen,
    Building2,
    Phone,
    Users,
    Shield,
    Send,
    Layout,
    Image as ImageIcon,
    PenTool,
    File
} from 'lucide-react';
import adminFetch from '../utils/adminApi';
import { Link } from 'react-router-dom';

// Page configuration with refined colors and descriptions
const pageConfig = {
    home: {
        icon: Home,
        description: 'Manage Hero, Welcome, Facilities, and Playground sections.',
        label: 'Homepage',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        ring: 'group-hover:ring-orange-200'
    },
    'header': {
        icon: PenTool,
        description: 'Configure global navigation menu and brand logo.',
        label: 'Header',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        ring: 'group-hover:ring-rose-200'
    },
    'footer': {
        icon: Layout,
        description: 'Update footer links, contact info, and social media.',
        label: 'Footer',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        ring: 'group-hover:ring-indigo-200'
    },
    about: {
        icon: BookOpen,
        description: 'Tell your school history, milestones, and leadership story.',
        label: 'About Page',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        ring: 'group-hover:ring-blue-200'
    },
    academics: {
        icon: GraduationCap,
        description: 'Detail your academic programs, grades, and calendar.',
        label: 'Academics',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        ring: 'group-hover:ring-violet-200'
    },
    facilities: {
        icon: Building2,
        description: 'Showcase campus facilities and infrastructure.',
        label: 'Facilities',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        ring: 'group-hover:ring-amber-200'
    },
    activities: {
        icon: Globe,
        description: 'Highlight extracurricular activities and events.',
        label: 'Activities',
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        border: 'border-pink-100',
        ring: 'group-hover:ring-pink-200'
    },
    admissions: {
        icon: Send,
        description: 'Guide parents through the admission process.',
        label: 'Admissions',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        ring: 'group-hover:ring-emerald-200'
    },
    'application-form': {
        icon: File,
        description: 'Customize admission form documents and messages.',
        label: 'Application Form',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        ring: 'group-hover:ring-orange-200'
    },
    gallery: {
        icon: ImageIcon,
        description: 'Curate the school photo gallery and albums.',
        label: 'Gallery',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-100',
        ring: 'group-hover:ring-teal-200'
    },
    contact: {
        icon: Phone,
        description: 'Manage contact information and school timings.',
        label: 'Contact Us',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        ring: 'group-hover:ring-rose-200'
    },
    apply: {
        icon: Send,
        description: 'Customize the online application form and messages.',
        label: 'Apply Page',
        color: 'text-violet-600',
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        ring: 'group-hover:ring-violet-200'
    }
};

const Editor = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await adminFetch('/site-content/pages');
            if (response.ok) {
                const data = await response.json();

                // Core pages that should always appear (even if not in DB)
                const corePages = ['home', 'header', 'footer', 'about', 'academics', 'admissions', 'facilities', 'contact', 'apply'];

                // Create a map of existing pages from DB
                const existingPages = {};
                data.forEach(p => {
                    existingPages[p.page_slug] = p;
                });

                // Merge: add core pages that don't exist in DB with 0 sections
                const mergedPages = [...data];
                corePages.forEach(slug => {
                    if (!existingPages[slug]) {
                        mergedPages.push({ page_slug: slug, section_count: 0 });
                    }
                });

                // Sort pages: core pages first, then alphabetically
                const coreOrder = ['home', 'header', 'footer', 'about', 'academics', 'admissions', 'facilities', 'contact', 'apply'];
                const sortedData = mergedPages.sort((a, b) => {
                    const indexA = coreOrder.indexOf(a.page_slug);
                    const indexB = coreOrder.indexOf(b.page_slug);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return a.page_slug.localeCompare(b.page_slug);
                });

                setPages(sortedData);
            } else {
                setError('Failed to load pages');
            }
        } catch (err) {
            console.error('Failed to fetch pages:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const getPageDetails = (slug) => {
        return pageConfig[slug] || {
            icon: Info,
            description: 'Manage page content',
            label: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
            color: 'text-slate-600',
            bg: 'bg-slate-50',
            border: 'border-slate-100',
            ring: 'group-hover:ring-slate-200'
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <Loader2 size={48} className="animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-sans pb-32">
            {/* Top Navigation Bar */}
            <div className="px-8 py-8">
                <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Dashboard</span>
                </Link>
            </div>

            {/* Header Content */}
            <div className="text-center mb-20 px-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm font-serif font-bold">E</span>
                </div>
                <h1 className="text-5xl font-serif font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                    Site Editor
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Shape your school's online presence. Select a section below to customize content, images, and layout settings.
                </p>
            </div>

            {/* Pages Grid */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => {
                    const details = getPageDetails(page.page_slug);
                    const Icon = details.icon;

                    return (
                        <Link
                            key={page.page_slug}
                            to={`/admin/editor/${page.page_slug}`}
                            className={`
                                group relative bg-white rounded-2xl p-6 
                                border ${details.border} hover:border-transparent
                                shadow-sm hover:shadow-xl hover:shadow-slate-200/50 
                                transition-all duration-300 ring-1 ring-transparent ${details.ring}
                            `}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className={`w-12 h-12 rounded-xl ${details.bg} ${details.color} flex items-center justify-center`}>
                                    <Icon size={24} />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                                {details.label}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed mb-4 min-h-[40px]">
                                {details.description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-slate-900 transition-colors uppercase tracking-wider">
                                <span className={`w-1.5 h-1.5 rounded-full ${details.bg.replace('bg-', 'bg-slate-200 ')} group-hover:${details.bg.replace('bg-', 'bg-')}-500 transition-colors`}></span>
                                <span>{page.section_count} Sections</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer Stats - Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
                <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-2xl p-6 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-4 px-6 border-r border-slate-100">
                        <div className="text-3xl font-serif font-bold text-slate-900">{pages.length}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total<br />Pages</div>
                    </div>

                    <div className="flex-1 flex justify-center gap-12 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-600">System Online</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <RefreshCw size={14} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">Auto-save Ready</span>
                        </div>
                    </div>

                    <div className="px-6 text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                        <div className="text-sm font-bold text-emerald-600">Active</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for demo images if available
const existingImageForSlug = (slug) => {
    return null;
};

export default Editor;
