import React from 'react';
import FadeIn from '../UI/FadeIn';
import { Wifi, Monitor, Server, Lock } from 'lucide-react';

const iconMap = {
    Wifi,
    Monitor,
    Server,
    Lock
};

const DigitalCampus = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const description = data.description;
    const image = data.image;
    const features = data.features || [];

    const getIcon = (iconName) => iconMap[iconName] || Wifi;

    return (
        <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
            {/* Tech Background Elements */}
            <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/circuit.png')]"></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1">
                        <FadeIn>
                            {tagline && (
                                <div className="inline-block px-3 py-1 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm mb-6">
                                    <span className="text-secondary font-bold tracking-widest text-xs uppercase">{tagline}</span>
                                </div>
                            )}
                            {title && <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white leading-tight">{title}</h2>}
                            {description && <p className="text-lg text-gray-400 mb-10 leading-relaxed font-light">{description}</p>}

                            {features.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {features.map((feature, idx) => {
                                        const IconComponent = getIcon(feature.icon);
                                        return (
                                            <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors duration-300 group">
                                                <div className="flex items-start gap-4">
                                                    <div className="bg-gradient-to-br from-gray-800 to-black p-3 rounded-lg text-secondary border border-white/10 group-hover:border-secondary/50 transition-colors shadow-lg">
                                                        <IconComponent size={24} />
                                                    </div>
                                                    <div>
                                                        {feature.title && <h4 className="font-bold text-lg text-white mb-1 group-hover:text-secondary transition-colors">{feature.title}</h4>}
                                                        {feature.desc && <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </FadeIn>
                    </div>

                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <FadeIn delay={200}>
                            {image && (
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <img
                                        src={image}
                                        alt="Digital Campus"
                                        className="relative rounded-2xl shadow-2xl border border-white/10 w-full"
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent"></div>

                                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                                        <div className="flex items-center gap-3 text-white">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-sm font-mono">System Status: Operational</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DigitalCampus;
