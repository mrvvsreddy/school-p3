import React from 'react';

const FounderMessage = ({ data, loading }) => {
    // If loading or no data, don't render
    if (loading || !data) return null;

    const founder = data.founder || {};
    const mainImage = data.images?.main;

    return (
        <section className="py-20 bg-stone-50 overflow-hidden font-serif">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    {/* Left: Image with Premium Badge */}
                    <div className="w-full lg:w-1/2 relative flex items-center justify-center">
                        {/* Main image with classic frame */}
                        {mainImage && (
                            <div className="relative z-10 w-full max-w-[380px]">
                                {/* Back decorative frame */}
                                <div className="absolute -inset-4 border-2 border-primary/20 rounded-sm transform translate-x-2 translate-y-2 z-0"></div>

                                <div className="relative overflow-hidden rounded-sm shadow-2xl aspect-[3/4] bg-gray-100 ring-1 ring-black/5 z-10">
                                    <img
                                        src={mainImage}
                                        alt="Founder"
                                        className="w-full h-full object-cover brightness-[1.02] contrast-[1.05]"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x500/f3f4f6/6d0b1a?text=Founder' }}
                                    />
                                    {/* Inner subtle vignette */}
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10"></div>
                                </div>
                            </div>
                        )}

                        {/* Seal-style Badge */}
                        {data.years_badge && (
                            <div className="absolute -top-6 -right-4 lg:right-10 z-20">
                                <div className="relative group">
                                    {/* Animated outer ring */}
                                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                                    <div className="bg-white p-1.5 rounded-full shadow-xl">
                                        <div className="w-24 h-24 rounded-full bg-primary flex flex-col items-center justify-center text-center p-1 border-[3px] border-double border-white shadow-inner">
                                            <span className="text-2xl font-bold text-white block leading-none font-serif relative top-1">
                                                {data.years_badge}
                                            </span>
                                            <span className="text-[9px] font-medium text-white/90 uppercase tracking-widest mt-1 border-t border-white/30 pt-0.5 w-12">
                                                {data.years_label || 'Years'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Text Content */}
                    <div className="w-full lg:w-1/2 text-left">
                        {data.tagline && (
                            <div className="flex items-center gap-4 mb-6">
                                <span className="h-[1px] w-12 bg-primary/60"></span>
                                <span className="text-primary font-sans font-bold tracking-[0.2em] text-xs uppercase">
                                    {data.tagline}
                                </span>
                            </div>
                        )}

                        {data.title && (
                            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 text-gray-900 leading-[1.1]">
                                {data.title}
                            </h2>
                        )}

                        <div className="prose prose-lg prose-p:text-gray-600 prose-headings:font-serif max-w-none">
                            {data.description && (
                                <p className="mb-6 leading-relaxed text-base md:text-lg text-gray-700 first-letter:float-left first-letter:text-6xl first-letter:pr-3 first-letter:font-bold first-letter:text-primary first-letter:font-serif first-letter:mr-2 first-letter:-mt-2">
                                    {data.description}
                                </p>
                            )}
                        </div>

                        {data.quote && (
                            <div className="my-8 pl-6 border-l-4 border-accent/40 bg-accent/5 py-4 pr-4 rounded-r-lg">
                                <blockquote className="text-lg md:text-xl font-serif text-gray-800 italic leading-relaxed relative">
                                    <span className="text-primary/20 text-4xl absolute -top-4 -left-2">"</span>
                                    {data.quote}
                                </blockquote>
                            </div>
                        )}

                        {founder.name && (
                            <div className="mt-10 flex items-center gap-5">
                                {founder.image && (
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm transform translate-y-1"></div>
                                        <img
                                            src={founder.image}
                                            alt={founder.name}
                                            className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                            onError={(e) => { e.target.src = 'https://placehold.co/100x100/6d0b1a/white?text=F' }}
                                        />
                                    </div>
                                )}
                                <div>
                                    <div className="font-handwriting text-2xl text-gray-900 transform -rotate-2 origin-left">
                                        {founder.name}
                                    </div>
                                    {founder.role && (
                                        <p className="text-xs font-sans text-gray-500 font-bold uppercase tracking-widest mt-1">
                                            {founder.role}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FounderMessage;
