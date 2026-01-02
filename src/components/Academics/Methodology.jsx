import React from 'react';
import FadeIn from '../UI/FadeIn';

const Methodology = ({ data }) => {
    // If no data, don't render
    if (!data) return null;

    const cards = data.cards || [];

    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col gap-16">
                    {/* Top Section: Title & Image */}
                    <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
                        <div className="lg:w-1/2">
                            <FadeIn>
                                {data.tagline && (
                                    <div className="inline-block px-4 py-1.5 bg-white border border-gray-200 rounded-full mb-6 shadow-sm">
                                        <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">{data.tagline}</span>
                                    </div>
                                )}
                                {data.title && (
                                    <h2 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">{data.title}</h2>
                                )}
                                {data.description && (
                                    <p className="text-lg text-gray-600 mb-0 leading-relaxed font-light">
                                        {data.description}
                                    </p>
                                )}
                            </FadeIn>
                        </div>

                        {data.image && (
                            <div className="lg:w-1/2 relative">
                                <FadeIn delay={200} className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-[2rem] blur-2xl"></div>
                                    <img
                                        src={data.image}
                                        alt="Methodology"
                                        className="rounded-[2rem] shadow-2xl border-4 border-white relative z-10 w-full max-h-[400px] object-cover"
                                        onError={(e) => { e.target.src = 'https://placehold.co/800x600/f3f4f6/6d0b1a?text=Methodology' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-[2rem] z-10 pointer-events-none"></div>
                                </FadeIn>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Grid */}
                    {cards.length > 0 && (
                        <FadeIn delay={400}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {cards.map((card, index) => (
                                    <div key={index} className="flex items-start gap-5 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group cursor-default">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-0 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                            <span className="font-serif font-bold text-lg">{index + 1}</span>
                                        </div>
                                        <div className="pt-0.5">
                                            {card.title && (
                                                <h4 className="font-bold text-lg mb-2 text-primary group-hover:text-slate-900 transition-colors">{card.title}</h4>
                                            )}
                                            {card.description && (
                                                <p className="text-sm text-gray-600 leading-relaxed font-medium">{card.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Methodology;
