import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Academies = ({ data, loading }) => {
    // If loading or no data, don't render
    if (loading || !data) return null;

    const academies = data.academies || [];
    if (academies.length === 0) return null;

    return (
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">

                <div className="text-center max-w-4xl mx-auto mb-20">
                    {data.tagline && (
                        <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
                            <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">{data.tagline}</span>
                        </div>
                    )}
                    {data.title && (
                        <h2 className="text-4xl md:text-6xl font-serif font-black text-white leading-tight">
                            {data.title}
                        </h2>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {academies.map((academy, index) => (
                        <div key={academy.id || index} className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={academy.image}
                                    alt={academy.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    onError={(e) => { e.target.src = 'https://placehold.co/400x600/1a1a1a/white?text=Academy' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-300"></div>
                            </div>

                            {/* Number Overlay */}
                            <div className="absolute top-6 right-6 font-serif text-6xl font-black text-white/5 select-none z-0 group-hover:text-white/20 transition-colors">
                                0{index + 1}
                            </div>

                            {/* Content */}
                            <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-start justify-end h-full z-10">
                                <div className="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/10 w-full hover:bg-black/40 hover:border-white/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-2xl font-bold font-serif text-white group-hover:text-secondary transition-colors">
                                            {academy.name}
                                        </h3>
                                        <ArrowUpRight className="text-white/50 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>

                                    <div className="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-300">
                                        <p className="text-sm text-gray-300 leading-relaxed font-light line-clamp-3">
                                            {academy.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Academies;
