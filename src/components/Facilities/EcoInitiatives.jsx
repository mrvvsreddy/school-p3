import React from 'react';
import FadeIn from '../UI/FadeIn';
import { Sun, Droplets, Recycle, TreePine, ArrowUpRight } from 'lucide-react';

const iconMap = {
    Sun,
    Droplets,
    Recycle,
    TreePine
};

const EcoInitiatives = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const subtitle = data.subtitle;
    const description = data.description;
    const initiatives = data.initiatives || [];

    const getIcon = (iconName) => iconMap[iconName] || TreePine;

    // Separate main feature from others
    const mainFeature = initiatives[0];
    const otherFeatures = initiatives.slice(1);

    return (
        <section className="py-24 bg-stone-50 relative overflow-hidden">
            {/* Nature Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-100/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-100/60 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-10">
                    <div className="max-w-2xl">
                        <FadeIn>
                            {tagline && (
                                <div className="inline-block px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full mb-4">
                                    <span className="text-emerald-700 font-bold tracking-widest text-xs uppercase">{tagline}</span>
                                </div>
                            )}
                            {title && (
                                <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                                    {title} <br />{subtitle && <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{subtitle}</span>}
                                </h2>
                            )}
                        </FadeIn>
                    </div>
                    <FadeIn delay={200}>
                        {description && <p className="text-gray-600 max-w-md text-lg leading-relaxed font-light lg:text-right">{description}</p>}
                    </FadeIn>
                </div>

                {initiatives.length > 0 && (
                    <div className="grid grid-cols-1 gap-8">
                        {/* Main Feature - Horizontal Card */}
                        {mainFeature && (
                            <FadeIn>
                                <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-emerald-900/5 border border-emerald-100/50 flex flex-col md:flex-row gap-8 items-center overflow-hidden group">
                                    <div className="md:w-1/2 w-full h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden relative">
                                        {mainFeature.image && (
                                            <img
                                                src={mainFeature.image}
                                                alt={mainFeature.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-2xl text-emerald-600 shadow-sm">
                                            {React.createElement(getIcon(mainFeature.icon), { size: 28 })}
                                        </div>
                                    </div>
                                    <div className="md:w-1/2 w-full p-4 md:p-8">
                                        <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors">{mainFeature.title}</h3>
                                        {mainFeature.desc && <p className="text-gray-600 text-lg leading-relaxed mb-6 font-light">{mainFeature.desc}</p>}

                                        <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-sm">
                                            Learn More <ArrowUpRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        )}

                        {/* Other Features - Grid */}
                        {otherFeatures.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {otherFeatures.map((feature, idx) => (
                                    <FadeIn key={idx} delay={idx * 100}>
                                        <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-emerald-900/5 border border-emerald-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                    {React.createElement(getIcon(feature.icon), { size: 24 })}
                                                </div>
                                            </div>

                                            {feature.image && (
                                                <div className="h-40 w-full mb-6 rounded-2xl overflow-hidden relative">
                                                    <img src={feature.image} alt={feature.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                            )}

                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                                            {feature.desc && <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>}
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default EcoInitiatives;
