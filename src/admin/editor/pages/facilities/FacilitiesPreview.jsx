import React, { useMemo } from 'react';
import { Book, FlaskConical, Trophy, Bus, Coffee, Dumbbell, Sun, TreePine, Droplets, Wifi, Monitor, Server, Lock, Video, Users, Bell, ShieldCheck, ArrowUpRight } from 'lucide-react';

// Icon mapping
const iconMap = {
    Book, FlaskConical, Trophy, Bus, Coffee, Dumbbell,
    Sun, TreePine, Droplets, Wifi, Monitor, Server, Lock, Video, Users, Bell
};

const FacilitiesPreview = ({ content }) => {
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
    const facilityGrid = sections.facility_grid || {};
    const eco = sections.eco_initiatives || {};
    const digital = sections.digital_campus || {};
    const safety = sections.safety_security || {};

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={hero.image || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2686&auto=format&fit=crop"}
                        alt="School Campus"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40 mix-blend-multiply"></div>
                </div>
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                    <span className="text-amber-400 font-bold tracking-[0.2em] text-sm uppercase mb-6 block">
                        {hero.tagline || 'World-Class Infrastructure'}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white">
                        {hero.title || 'Campus & Facilities'}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto font-light leading-relaxed">
                        {hero.subtitle || 'A state-of-the-art environment designed to inspire learning, creativity, and holistic development.'}
                    </p>
                </div>
            </div>

            {/* Facility Grid Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <span className="text-amber-600 font-bold tracking-widest text-xs uppercase block mb-2">
                            {facilityGrid.tagline || 'Campus Life'}
                        </span>
                        <h2 className="text-3xl font-serif font-bold text-slate-900">
                            {facilityGrid.title || 'Student Amenities'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(facilityGrid.facilities || []).map((fac, idx) => {
                            const FacIcon = iconMap[fac.icon] || Book;
                            return (
                                <div key={idx} className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-100 relative h-72">
                                    <div className="absolute inset-0">
                                        <img
                                            src={fac.image}
                                            alt={fac.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-slate-900 mb-3 opacity-0 group-hover:opacity-100 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                            <FacIcon size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{fac.title}</h3>
                                        <p className="text-gray-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                            {fac.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Eco Initiatives Section */}
            <section className="py-20 bg-slate-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-teal-500/10 rounded-full blur-[100px]"></div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-2xl">
                            <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase block mb-3 pl-1">
                                {eco.tagline || 'Sustainability'}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                                {eco.title || 'A Living Laboratory'} <br />for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{eco.title_highlight || 'Greener Future'}</span>
                            </h2>
                        </div>
                        <p className="text-gray-400 max-w-md text-base leading-relaxed">
                            {eco.description || 'Our campus isn\'t just a place to learn—it\'s a testament to our commitment to the planet.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(eco.cards || []).map((card, idx) => {
                            const CardIcon = iconMap[card.icon] || Sun;
                            return (
                                <div key={idx} className="relative group rounded-2xl overflow-hidden h-64">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                        <div className="self-end bg-emerald-500/20 backdrop-blur-md p-2 rounded-lg text-emerald-300">
                                            <CardIcon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                                            <p className="text-sm text-gray-200">{card.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {(eco.stats || []).map((stat, idx) => {
                            const colorMap = {
                                emerald: 'text-emerald-400',
                                blue: 'text-blue-400',
                                yellow: 'text-yellow-400',
                                purple: 'text-purple-400'
                            };
                            return (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
                                    <div className={`text-2xl font-bold mb-1 ${colorMap[stat.color] || 'text-emerald-400'}`}>{stat.value}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Digital Campus Section */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/2">
                            <span className="text-amber-400 font-bold tracking-widest text-xs uppercase block mb-2">
                                {digital.tagline || 'Future Ready'}
                            </span>
                            <h2 className="text-3xl font-serif font-bold mb-4 text-white">
                                {digital.title || 'Digital Campus'}
                            </h2>
                            <p className="text-base text-white/80 mb-6 leading-relaxed">
                                {digital.description || 'Seamlessly integrating technology into education.'}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(digital.features || []).map((feat, idx) => {
                                    const FeatIcon = iconMap[feat.icon] || Wifi;
                                    return (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="bg-white/10 p-2 rounded-lg text-amber-400">
                                                <FeatIcon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base text-white">{feat.title}</h4>
                                                <p className="text-sm text-gray-400">{feat.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="lg:w-1/2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-400/20 rounded-2xl transform rotate-6 translate-x-4 translate-y-4"></div>
                                <img
                                    src={digital.image || "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop"}
                                    alt="Digital Learning"
                                    className="rounded-2xl shadow-2xl relative z-10 border border-white/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Safety Security Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/2 order-2 lg:order-1 relative">
                            <img
                                src={safety.image || "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=2670&auto=format&fit=crop"}
                                alt="Student Safety"
                                className="rounded-2xl shadow-xl w-full"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-xl shadow-lg max-w-xs hidden md:block">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="text-green-600 w-8 h-8" />
                                    <div>
                                        <p className="font-bold text-gray-900">{safety.badge?.title || 'Certified Safe'}</p>
                                        <p className="text-xs text-gray-500">{safety.badge?.subtitle || 'ISO 9001 Compliant Campus'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <span className="text-amber-600 font-bold tracking-widest text-xs uppercase block mb-2">
                                {safety.tagline || 'Safety First'}
                            </span>
                            <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900">
                                {safety.title || 'Secure Learning Environment'}
                            </h2>
                            <p className="text-base text-gray-700 mb-6 leading-relaxed">
                                {safety.description || 'The safety of our students is non-negotiable.'}
                            </p>

                            <div className="space-y-4">
                                {(safety.features || []).map((feat, idx) => {
                                    const FeatIcon = iconMap[feat.icon] || Video;
                                    return (
                                        <div key={idx} className="flex gap-3">
                                            <div className="bg-white p-2 shadow-sm rounded-lg h-fit text-slate-900 border border-gray-100">
                                                <FeatIcon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{feat.title}</h4>
                                                <p className="text-sm text-gray-600">{feat.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FacilitiesPreview;
