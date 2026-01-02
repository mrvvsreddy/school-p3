import React from 'react';
import FadeIn from '../UI/FadeIn';

const CampusGallery = ({ data }) => {
    if (!data) return null;

    const title = data.title;
    const images = data.images || [];

    if (images.length === 0) return null;

    // Helper for masonry-like pattern variation
    const getClassForIndex = (index) => {
        // Pattern: Big, Small, Small, Tall, Small, Small... (simplified for grid)
        // For a simple uniform grid that looks masonry:
        return "";
    };

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    {title && (
                        <div className="inline-block relative">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">{title}</h2>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10"></div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[300px] gap-6">
                    {images.map((place, idx) => {
                        // Make every 4th item span 2 columns if on large screen, for visual interest
                        const spanClass = (idx % 4 === 0 || idx % 4 === 3) ? "lg:col-span-2" : "lg:col-span-1";

                        return (
                            <FadeIn
                                key={idx}
                                delay={idx * 50}
                                className={`relative rounded-xl overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-500 ring-1 ring-gray-100 ${spanClass}`}
                            >
                                <img
                                    src={place.url || place.src || place.img}
                                    alt={place.label || place.alt}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    onError={(e) => { e.target.src = 'https://placehold.co/800x600/f3f4f6/6d0b1a?text=Gallery' }}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>

                                <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <span className="block w-12 h-1 bg-secondary mb-3"></span>
                                        <span className="text-white font-serif text-2xl font-bold tracking-wide drop-shadow-lg">{place.label || place.alt}</span>
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

export default CampusGallery;
