import React from 'react';
import FadeIn from '../UI/FadeIn';

const Leadership = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const members = data.members || [];

    if (members.length === 0) return null;

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn className="text-center mb-16">
                    {tagline && (
                        <div className="inline-block px-4 py-1 bg-secondary/10 rounded-full mb-4">
                            <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">{tagline}</span>
                        </div>
                    )}
                    {title && <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">{title}</h2>}
                    <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {members.map((person, idx) => (
                        <FadeIn key={idx} delay={idx * 100} className="group cursor-pointer">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                    <img
                                        src={person.image || person.img}
                                        alt={person.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x500/f1f5f9/94a3b8?text=Leader' }}
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-6 text-center relative">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    {person.name && <h3 className="text-xl font-serif font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{person.name}</h3>}
                                    {person.role && <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{person.role}</p>}
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Leadership;
