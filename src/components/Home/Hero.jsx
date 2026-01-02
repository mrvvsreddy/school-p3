import React from 'react';
import { ChevronRight, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = ({ data, loading }) => {
    // If loading or no data, don't render
    if (loading || !data) return null;

    return (
        <section className="relative overflow-hidden min-h-[90dvh] flex items-center bg-white pt-24 md:pt-20">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-gray-50 to-transparent -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto mb-16">
                    {/* Centered Content */}
                    <div className="space-y-6 animate-fade-in-up">
                        {data.tagline && (
                            <div className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-primary/10 mb-4 shadow-sm">
                                <span className="text-primary font-bold uppercase tracking-widest text-xs">{data.tagline}</span>
                            </div>
                        )}

                        {data.title && (
                            <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif font-black leading-tight text-slate-900 tracking-tight">
                                {data.title}
                            </h1>
                        )}

                        {data.subtitle && (
                            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
                                {data.subtitle}
                            </p>
                        )}

                        {data.button && (
                            <div className="pt-8 flexflex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to={data.button.url || '/about'}
                                    className="group relative inline-flex items-center justify-center px-10 py-5 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest overflow-hidden transition-all hover:bg-slate-800 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {data.button.text} <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hero Image - Bottom Centered */}
                {data.image && (
                    <div className="relative w-full max-w-6xl mx-auto mt-8 animate-fade-in-up delay-200">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src={data.image}
                                alt="Campus Life"
                                className="w-full min-h-[300px] h-auto md:h-[600px] object-cover hover:scale-105 transition-transform duration-[2s]"
                                onError={(e) => { e.target.src = 'https://placehold.co/1200x600/f3f4f6/6d0b1a?text=EduNet+Campus' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                            {/* Floating Badge - Repositioned */}
                            {data.badge && (
                                <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-white/50 max-w-[200px] md:max-w-[240px]">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-5xl font-serif font-bold text-primary">{data.badge.rank}</span>
                                        <div className="w-12 h-1 bg-secondary mb-2"></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">National Distinction</p>
                                            <p className="text-sm font-bold text-slate-900 leading-tight">{data.badge.text}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Hero;
