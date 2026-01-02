import React from 'react';
import FadeIn from '../UI/FadeIn';
import { Book, FlaskConical, Trophy, Bus, Coffee, Dumbbell, ArrowUpRight } from 'lucide-react';

const iconMap = {
    Book,
    FlaskConical,
    Trophy,
    Bus,
    Coffee,
    Dumbbell
};

const FacilityGrid = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const facilities = data.facilities || [];

    if (facilities.length === 0) return null;

    const getIcon = (iconName) => iconMap[iconName] || Book;

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <FadeIn delay={0}>
                        {tagline && (
                            <div className="inline-block px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full mb-6">
                                <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">{tagline}</span>
                            </div>
                        )}
                        {title && <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">{title}</h2>}
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {facilities.map((fac, idx) => {
                        const IconComponent = getIcon(fac.icon);
                        return (
                            <FadeIn key={idx} delay={idx * 100}>
                                <div className="group bg-white border border-gray-100 rounded-2xl p-0 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 h-full flex flex-col overflow-hidden">
                                    <div className="relative h-64 overflow-hidden">
                                        {fac.image && (
                                            <img
                                                src={fac.image}
                                                alt={fac.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                onError={(e) => { e.target.src = 'https://placehold.co/600x400/f3f4f6/000000?text=Facility' }}
                                            />
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg text-primary">
                                            <IconComponent size={24} strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-grow">
                                        {fac.title && <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">{fac.title}</h3>}

                                        {fac.desc && (
                                            <p className="text-gray-500 text-base leading-relaxed mb-6 line-clamp-3">
                                                {fac.desc}
                                            </p>
                                        )}

                                        <div className="mt-auto flex items-center text-sm font-bold text-primary uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                                            Explore <span className="ml-2">→</span>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FacilityGrid;
