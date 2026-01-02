import React from 'react';
import { Target, Eye, ArrowUpRight } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const MissionVision = ({ data }) => {
    if (!data) return null;

    const mission = data.mission || {};
    const vision = data.vision || {};

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Mission Card - Dark Slate */}
                    <FadeIn delay={100} className="w-full lg:w-1/2">
                        <div className="h-full bg-slate-900 text-white p-12 lg:p-16 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                                <Target size={240} strokeWidth={0.5} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                                    <Target size={32} className="text-white" />
                                </div>

                                {mission.title && (
                                    <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-6 text-white">
                                        {mission.title}
                                    </h2>
                                )}

                                {mission.description && (
                                    <p className="text-slate-300 leading-relaxed text-lg font-light mb-8 flex-grow">
                                        {mission.description}
                                    </p>
                                )}

                                <div className="mt-auto">
                                    <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-secondary group-hover:translate-x-2 transition-transform duration-300">
                                        <span>Our Commitment</span>
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Vision Card - Primary/Maroon */}
                    <FadeIn delay={200} className="w-full lg:w-1/2">
                        <div className="h-full bg-primary text-white p-12 lg:p-16 rounded-[2rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:-rotate-12 duration-700">
                                <Eye size={240} strokeWidth={0.5} />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                                    <Eye size={32} className="text-white" />
                                </div>

                                {vision.title && (
                                    <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-6 text-white">
                                        {vision.title}
                                    </h2>
                                )}

                                {vision.description && (
                                    <p className="text-white/80 leading-relaxed text-lg font-light mb-8 flex-grow">
                                        {vision.description}
                                    </p>
                                )}

                                <div className="mt-auto">
                                    <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-secondary group-hover:translate-x-2 transition-transform duration-300">
                                        <span>Future Outlook</span>
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

export default MissionVision;
