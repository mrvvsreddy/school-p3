import React, { useMemo } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight, Send } from 'lucide-react';

// Icon mapping
const iconMap = { MapPin, Phone, Mail, Clock };

const ContactPreview = ({ content }) => {
    // Parse content sections
    const sections = useMemo(() => {
        const map = {};
        if (!content || !Array.isArray(content)) return map;

        content.forEach(section => {
            let parsedContent = section.content;
            if (typeof parsedContent === 'string') {
                try {
                    parsedContent = JSON.parse(parsedContent);
                } catch { parsedContent = {}; }
            }
            map[section.section_key] = parsedContent || {};
        });
        return map;
    }, [content]);

    const hero = sections.hero || {};
    const infoCards = sections.info_cards || {};
    const formSettings = sections.form_settings || {};
    const mapData = sections.map || {};

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-gray-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src={hero.image || "https://images.unsplash.com/photo-1423666639041-f1400517185b?q=80&w=2674&auto=format&fit=crop"}
                        alt="Contact Us"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/90"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <span className="text-amber-400 font-bold tracking-[0.2em] text-sm uppercase mb-4 block">
                        {hero.tagline || 'Get in Touch'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white drop-shadow-md">
                        {hero.title || 'Contact Us'}
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl mx-auto font-light">
                        {hero.subtitle || 'We are here to answer your questions and welcome you to our community.'}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 md:px-6 -mt-16 relative z-20 mb-16">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left: Form */}
                    <div className="w-full lg:w-3/5">
                        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/50 relative overflow-hidden">
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
                                {formSettings.title || 'Send us a Message'}
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="absolute left-4 -top-2.5 text-xs bg-white px-2 text-primary">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            disabled
                                            className="w-full bg-white/50 border border-gray-200 px-4 py-3 rounded-xl text-gray-400"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="absolute left-4 -top-2.5 text-xs bg-white px-2 text-primary">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            disabled
                                            className="w-full bg-white/50 border border-gray-200 px-4 py-3 rounded-xl text-gray-400"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="absolute left-4 -top-2.5 text-xs bg-white px-2 text-primary">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            disabled
                                            className="w-full bg-white/50 border border-gray-200 px-4 py-3 rounded-xl text-gray-400"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="absolute left-4 -top-2.5 text-xs bg-white px-2 text-primary">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            disabled
                                            className="w-full bg-white/50 border border-gray-200 px-4 py-3 rounded-xl text-gray-400"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="absolute left-4 -top-2.5 text-xs bg-white px-2 text-primary">
                                        Subject
                                    </label>
                                    <select
                                        disabled
                                        className="w-full bg-white/50 border border-gray-200 px-4 py-3 rounded-xl text-gray-700 appearance-none"
                                    >
                                        {(formSettings.subjects || []).map((subj, idx) => (
                                            <option key={idx} value={subj.value}>{subj.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative">
                                    <label className="absolute left-4 -top-2.5 text-xs bg-white px-2 text-primary">
                                        Message *
                                    </label>
                                    <textarea
                                        rows="4"
                                        disabled
                                        className="w-full bg-white/50 border border-gray-200 px-4 py-3 rounded-xl text-gray-400 resize-none"
                                        placeholder="Your message here..."
                                    ></textarea>
                                </div>
                                <button
                                    disabled
                                    className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
                                >
                                    Send Message
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info Cards */}
                    <div className="w-full lg:w-2/5">
                        <div className="flex flex-col gap-4 pt-4">
                            {(infoCards.cards || []).map((card, idx) => {
                                const CardIcon = iconMap[card.icon] || Phone;
                                return (
                                    <div key={idx} className="group bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex items-start gap-4 cursor-pointer relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>
                                        <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                                            <CardIcon size={20} />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-base font-serif font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
                                            <div className="text-sm text-gray-500 font-medium space-y-0.5 leading-relaxed">
                                                {(card.lines || []).map((line, i) => (
                                                    <p key={i} className="group-hover:text-gray-700 transition-colors">{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="self-center text-gray-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <ArrowRight size={16} className="text-primary" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="w-full relative" style={{ height: mapData.height || '400px' }}>
                <iframe
                    src={mapData.embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d94380.70293116676!2d-71.0588801!3d42.3600825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e370a5cb308779%3A0x40139b5b6329e46a!2sBoston%2C%20MA!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus"}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="School Location"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
            </div>
        </div>
    );
};

export default ContactPreview;
