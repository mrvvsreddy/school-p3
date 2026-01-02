import React from 'react';
import { GraduationCap, ArrowRight, Trophy, Users, Globe, BookOpen, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconMap = {
    GraduationCap: GraduationCap,
    Globe: Globe,
    Users: Users,
    Trophy: Trophy,
    BookOpen: BookOpen
};

const Features = ({ data, loading }) => {
    // If loading or no data, don't render
    if (loading || !data) return null;

    const features = data.features || [];
    const stats = data.stats || [];

    return (
        <section className="bg-white text-gray-900 py-32 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">

                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-20">

                    {/* Left: Headers and Stats */}
                    <div className="w-full lg:w-4/12">
                        <div className="relative lg:sticky lg:top-24">
                            {data.tagline && (
                                <span className="block text-secondary font-bold uppercase tracking-[0.2em] text-xs mb-6">
                                    {data.tagline}
                                </span>
                            )}
                            {data.title && (
                                <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight mb-8">
                                    {data.title}
                                </h2>
                            )}

                            {data.button && (
                                <Link
                                    to={data.button.url || '/about'}
                                    className="hidden lg:inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
                                >
                                    {data.button.text} <ArrowRight size={18} />
                                </Link>
                            )}

                            {/* Vertical Stats Layout */}
                            {stats.length > 0 && (
                                <div className="mt-16 grid grid-cols-1 gap-8 py-8 border-t border-gray-100">
                                    {stats.map((stat, index) => {
                                        const StatIcon = iconMap[stat.icon] || Trophy;
                                        return (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-50 rounded-xl text-primary">
                                                    <StatIcon size={24} />
                                                </div>
                                                <div>
                                                    <span className="block text-3xl font-bold font-serif">{stat.value}</span>
                                                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">{stat.text}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Feature Grid (Bento/List Style) */}
                    <div className="w-full lg:w-8/12">
                        {features.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {features.map((feature, index) => {
                                    const IconComponent = iconMap[feature.icon] || GraduationCap;
                                    const isLarge = index === 0 || index === 3; // Creative grid sizing

                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                group p-8 md:p-10 rounded-[2rem] bg-gray-50 border border-gray-100 hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all duration-500
                                                ${isLarge ? 'md:col-span-2 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-700' : ''}
                                            `}
                                        >
                                            <div className="flex items-start justify-between mb-8">
                                                <div className={`
                                                    w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                                                    ${isLarge ? 'bg-white/10 text-secondary' : 'bg-white text-primary shadow-sm'}
                                                `}>
                                                    <IconComponent strokeWidth={1.5} size={32} />
                                                </div>
                                                <div className={`
                                                    opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0
                                                    ${isLarge ? 'text-white' : 'text-primary'}
                                                `}>
                                                    <ArrowRight size={24} />
                                                </div>
                                            </div>

                                            {feature.title && (
                                                <h3 className={`text-2xl font-bold mb-4 font-serif ${isLarge ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                                            )}

                                            {feature.description && (
                                                <p className={`text-lg leading-relaxed ${isLarge ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {feature.description}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {data.button && (
                            <div className="mt-12 lg:hidden">
                                <Link
                                    to={data.button.url || '/about'}
                                    className="inline-flex w-full items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-primary/90 transition-all"
                                >
                                    {data.button.text} <ArrowRight size={18} />
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Features;
