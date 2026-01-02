import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Loader2, ChevronRight } from 'lucide-react';

const Header = ({ previewData }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [content, setContent] = useState(previewData || null);
    const [loading, setLoading] = useState(!previewData);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        if (previewData) {
            setContent(previewData);
            setLoading(false);
        } else {
            fetchHeaderContent();
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [previewData]);

    const fetchHeaderContent = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/v1/site-content/public/header`);
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
            console.error('Failed to fetch header content:', err);
        } finally {
            setLoading(false);
        }
    };

    // Don't render until data is loaded
    if (loading || !content) {
        return (
            <header className="fixed top-0 left-0 w-full z-50 h-20 flex items-center justify-center bg-white/80 backdrop-blur-md">
                <Loader2 className="animate-spin text-primary" size={24} />
            </header>
        );
    }

    const brand = content.brand || {};
    const navigation = content.navigation || {};
    const navLinks = navigation.links || [];

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out border-b ${scrolled
                ? 'bg-white/90 backdrop-blur-xl py-3 border-gray-200/50 shadow-sm'
                : 'bg-white/60 backdrop-blur-sm py-5 border-transparent'
                }`}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">

                    {/* Logo Section */}
                    <Link to="/" className="relative z-50 flex items-center gap-2 group">
                        <div className="flex flex-col">
                            <span className={`font-serif font-black text-2xl md:text-3xl tracking-tighter transition-colors duration-300 ${scrolled ? 'text-primary' : 'text-primary'}`}>
                                {brand.logo_text}
                                <span className="text-secondary ml-0.5">{brand.logo_accent}</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Centered Pill */}
                    <div className="hidden lg:flex items-center justify-center flex-1 px-8">
                        <nav className="flex items-center justify-center gap-8 bg-gray-50 px-12 py-3 rounded-full border border-gray-100 shadow-sm min-w-[700px] max-w-full">
                            {navLinks.map((link, i) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={i}
                                        to={link.path || '/'}
                                        className={`relative px-4 py-2 rounded-full text-base font-bold whitespace-nowrap transition-all duration-300 ${isActive
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right Side Actions / Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden relative z-50 p-2 text-primary hover:bg-primary/5 rounded-full transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <div
                className={`fixed inset-0 bg-white/95 backdrop-blur-2xl z-40 transition-all duration-500 lg:hidden flex items-center justify-center ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                    }`}
            >
                <nav className="w-full max-w-md px-6 flex flex-col gap-2">
                    {navLinks.map((link, i) => (
                        <Link
                            key={i}
                            to={link.path || '/'}
                            onClick={() => setIsMenuOpen(false)}
                            className={`group flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all duration-300 ${location.pathname === link.path
                                ? 'bg-primary/5 text-primary'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <span className="group-hover:translate-x-2 transition-transform duration-300">
                                {link.name}
                            </span>
                            {location.pathname === link.path && <ChevronRight size={20} />}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;
