import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Loader2 } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const Footer = ({ previewData }) => {
    const [content, setContent] = useState(previewData || null);
    const [loading, setLoading] = useState(!previewData);

    useEffect(() => {
        if (previewData) {
            setContent(previewData);
            setLoading(false);
        } else {
            fetchFooterContent();
        }
    }, [previewData]);

    const fetchFooterContent = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/site-content/public/footer`);
            if (response.ok) {
                const data = await response.json();
                const parsed = {};
                data.forEach(section => {
                    let sectionContent = section.content;
                    if (typeof sectionContent === 'string') {
                        try { sectionContent = JSON.parse(sectionContent); } catch { sectionContent = {}; }
                    }
                    parsed[section.section_key] = sectionContent || {};
                });
                setContent(parsed);
            }
        } catch (err) {
            console.error('Failed to fetch footer content:', err);
        } finally {
            setLoading(false);
        }
    };

    // Don't render until data is loaded
    if (loading || !content) {
        return (
            <footer className="bg-primary-dark text-white py-16 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={32} />
            </footer>
        );
    }

    const brand = content.brand || {};
    const quickLinks = content.quick_links || {};
    const programs = content.programs || {};
    const contactInfo = content.contact_info || {};
    const copyright = content.copyright || {};

    const socialLinks = brand.social_links || [];
    const quickLinksList = quickLinks.links || [];
    const programsList = programs.links || [];
    const copyrightLinks = copyright.links || [];

    const currentYear = new Date().getFullYear();
    const copyrightText = (copyright.text || '').replace('{year}', currentYear);

    const getSocialIcon = (label) => {
        const lower = (label || '').toLowerCase();
        if (lower.includes('facebook')) return <Facebook size={18} />;
        if (lower.includes('twitter')) return <Twitter size={18} />;
        if (lower.includes('instagram')) return <Instagram size={18} />;
        if (lower.includes('linkedin')) return <Linkedin size={18} />;
        return null;
    };

    return (
        <footer className="bg-slate-950 text-white pt-20 pb-10 border-t border-slate-900">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn delay={100}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

                        {/* Column 1: Brand & About (Span 4) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="text-3xl font-serif font-bold text-white tracking-tight">
                                {brand.name}<span className="text-secondary">{brand.accent}</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                                {brand.description}
                            </p>
                            <div className="flex gap-4 pt-2">
                                {socialLinks.map((social, i) => (
                                    <a key={i} href={social.url || '#'} className="bg-slate-900 p-2.5 rounded-full text-slate-400 hover:bg-secondary hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                                        {getSocialIcon(social.label)}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Quick Links (Span 2) */}
                        <div className="lg:col-span-2 lg:col-start-6">
                            <h3 className="text-lg font-medium text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
                                {quickLinks.title}
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                {quickLinksList.map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.url || '#'} className="hover:text-secondary transition-colors block py-0.5">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Programs (Span 2) */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-medium text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
                                {programs.title}
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-400">
                                {programsList.map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.url || '#'} className="hover:text-secondary transition-colors block py-0.5">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Contact Info (Span 3) */}
                        <div className="lg:col-span-3">
                            <h3 className="text-lg font-medium text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
                                {contactInfo.title}
                            </h3>
                            <ul className="space-y-5 text-sm text-slate-400">
                                {contactInfo.address && (
                                    <li className="flex items-start gap-3 group">
                                        <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                                            <MapPin size={18} className="shrink-0" />
                                        </div>
                                        <span className="leading-relaxed">{contactInfo.address}</span>
                                    </li>
                                )}
                                {contactInfo.phone && (
                                    <li className="flex items-center gap-3 group">
                                        <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                                            <Phone size={18} className="shrink-0" />
                                        </div>
                                        <span>{contactInfo.phone}</span>
                                    </li>
                                )}
                                {contactInfo.email && (
                                    <li className="flex items-center gap-3 group">
                                        <div className="p-2 bg-slate-900 rounded-lg group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                                            <Mail size={18} className="shrink-0" />
                                        </div>
                                        <span>{contactInfo.email}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                        <p>{copyrightText}</p>
                        <div className="flex gap-8">
                            {copyrightLinks.map((link, i) => (
                                <Link key={i} to={link.url || '#'} className="hover:text-white transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </FadeIn>
            </div>
        </footer>
    );
};

export default Footer;
