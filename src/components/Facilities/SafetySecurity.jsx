import React from 'react';
import FadeIn from '../UI/FadeIn';
import { ShieldCheck, Video, Users, Bell } from 'lucide-react';

const iconMap = {
    ShieldCheck,
    Video,
    Users,
    Bell
};

const SafetySecurity = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const description = data.description;
    const image = data.image;
    const features = data.features || [];
    const badge = data.badge || {};

    const getIcon = (iconName) => iconMap[iconName] || ShieldCheck;

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2 order-2 lg:order-1 relative">
                        <FadeIn delay={200}>
                            <div className="relative group">
                                <div className="absolute top-10 left-10 w-full h-full bg-slate-100 rounded-[2rem] -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
                                {image && (
                                    <img
                                        src={image}
                                        alt="Student Safety"
                                        className="rounded-[2rem] shadow-2xl w-full"
                                    />
                                )}

                                {badge.title && (
                                    <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs hidden md:block border border-gray-100 group-hover:-translate-y-2 transition-transform duration-500 delay-100">
                                        <div className="flex items-center gap-5">
                                            <div className="bg-green-50 p-3 rounded-full text-green-600">
                                                <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">{badge.title}</p>
                                                {badge.subtitle && <p className="text-sm text-gray-500 font-medium">{badge.subtitle}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    </div>

                    <div className="lg:w-1/2 order-1 lg:order-2">
                        <FadeIn>
                            {tagline && (
                                <div className="inline-block px-4 py-1.5 bg-red-50 border border-red-100 rounded-full mb-6">
                                    <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase">{tagline}</span>
                                </div>
                            )}
                            {title && <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-slate-900 leading-tight">{title}</h2>}
                            {description && <p className="text-lg text-gray-500 mb-12 leading-relaxed font-light">{description}</p>}

                            {features.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                                    {features.map((feature, idx) => {
                                        const IconComponent = getIcon(feature.icon);
                                        return (
                                            <div key={idx} className="flex flex-col gap-4 group cursor-default">
                                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-primary border border-red-100 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-1">
                                                    <IconComponent size={24} strokeWidth={2} />
                                                </div>
                                                <div>
                                                    {feature.title && <h4 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors">{feature.title}</h4>}
                                                    {feature.desc && <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.desc}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SafetySecurity;
