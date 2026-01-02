import React from 'react';
import { Clock } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const Timeline = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const items = data.items || data.events || [];

    if (items.length === 0) return null;

    return (
        <section className="py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn className="text-center mb-24 max-w-3xl mx-auto">
                    {tagline && (
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <span className="w-8 h-px bg-secondary"></span>
                            <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">{tagline}</span>
                            <span className="w-8 h-px bg-secondary"></span>
                        </div>
                    )}
                    {title && <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">{title}</h2>}
                </FadeIn>

                <div className="relative max-w-5xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-1/2"></div>

                    <div className="space-y-24">
                        {items.map((item, index) => {
                            const isLeft = index % 2 === 0;
                            return (
                                <div key={index} className={`relative flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row-reverse' : ''} gap-8 md:gap-16`}>

                                    {/* Content Side */}
                                    <div className="w-full md:w-1/2 pl-12 md:pl-0">
                                        <FadeIn
                                            delay={index * 100}
                                            className={`relative bg-white p-8 rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-xl transition-all duration-300 ${isLeft ? 'md:text-left' : 'md:text-right'}`}
                                        >
                                            {/* Pointer Arrow */}
                                            <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45 transform ${isLeft ? '-right-2.5 border-r-0 border-b-0' : '-left-2.5 border-t-0 border-l-0 border-r border-b'}`}></div>

                                            <div className="inline-block px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-base font-bold text-primary mb-4 shadow-sm">
                                                {item.year}
                                            </div>
                                            {item.title && <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">{item.title}</h3>}
                                            {(item.description || item.desc) && <p className="text-slate-600 leading-relaxed text-base font-medium">{item.description || item.desc}</p>}
                                        </FadeIn>
                                    </div>

                                    {/* Center Dot */}
                                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-lg z-10">
                                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                                    </div>

                                    {/* Empty Side for Spacing */}
                                    <div className="hidden md:block w-1/2"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Timeline;
