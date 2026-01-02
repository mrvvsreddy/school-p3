import React from 'react';
import { FileText, School, Baby, GraduationCap, HeartPulse, CreditCard, Plane, FileCheck } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const iconMap = {
    FileText,
    School,
    Baby,
    GraduationCap,
    HeartPulse,
    CreditCard,
    Plane,
    FileCheck
};

const RequirementsList = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const image = data.image;
    const requirements = data.requirements || [];

    if (requirements.length === 0) return null;

    const getIcon = (iconName) => iconMap[iconName] || FileText;

    return (
        <section className="py-24 bg-gray-50 text-slate-900 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col gap-16">
                    {/* Top Section: Title & Image */}
                    <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
                        <div className="lg:w-1/2">
                            <FadeIn delay={0}>
                                {tagline && (
                                    <div className="inline-block px-4 py-1.5 bg-white border border-gray-200 rounded-full mb-6 shadow-sm">
                                        <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase">{tagline}</span>
                                    </div>
                                )}
                                {title && <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-slate-900 leading-tight">{title}</h2>}
                            </FadeIn>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <FadeIn delay={200} className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-[2rem] blur-2xl"></div>
                                {image && (
                                    <img
                                        src={image}
                                        alt="Application Review"
                                        className="rounded-[2rem] shadow-2xl border-4 border-white relative z-10 w-full max-h-[400px] object-cover"
                                    />
                                )}
                                <div className="absolute -bottom-6 -right-6 bg-white text-gray-900 p-6 rounded-2xl shadow-xl hidden md:block max-w-[280px] z-20 border border-gray-100">
                                    <div className="flex gap-4 items-center">
                                        <div className="bg-green-50 p-3 rounded-full text-green-600 border border-green-100">
                                            <FileCheck size={28} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg leading-tight text-slate-900">Quick Verification</p>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">Processing mostly within 2-3 business days</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>
                    </div>

                    {/* Bottom Section: Grid */}
                    <FadeIn delay={400}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {requirements.map((req, idx) => {
                                const IconComponent = getIcon(req.icon);
                                return (
                                    <div key={idx} className="flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group cursor-default">
                                        <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0">
                                            <IconComponent size={20} />
                                        </div>
                                        <div className="pt-0.5">
                                            {req.text && <h4 className="text-primary font-bold text-base mb-1 group-hover:text-slate-900 transition-colors">{req.text}</h4>}
                                            {req.subtext && <p className="text-xs text-gray-500 font-medium leading-relaxed">{req.subtext}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
};

export default RequirementsList;
