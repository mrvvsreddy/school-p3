import React from 'react';
import { FileText, UserCheck, CreditCard, School, ArrowRight } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const iconMap = {
    FileText,
    UserCheck,
    CreditCard,
    School
};

const ProcessSteps = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const steps = data.steps || [];

    if (steps.length === 0) return null;

    const getIcon = (iconName) => iconMap[iconName] || FileText;

    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <FadeIn className="text-center mb-20 max-w-3xl mx-auto">
                    {tagline && (
                        <div className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full mb-4 shadow-sm">
                            <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase">{tagline}</span>
                        </div>
                    )}
                    {title && <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">{title}</h2>}
                </FadeIn>

                <div className="flex flex-col lg:flex-row gap-6 relative">
                    {steps.map((step, idx) => {
                        const IconComponent = getIcon(step.icon);
                        return (
                            <div key={idx} className="flex-1 group">
                                <FadeIn delay={idx * 150} className="h-full">
                                    <div className="relative h-full bg-white p-8 rounded-2xl border border-gray-100 hover:border-primary/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                                        {/* Number Watermark */}
                                        <div className="absolute top-4 right-6 text-6xl font-serif font-black text-gray-50 group-hover:text-primary/5 transition-colors select-none">
                                            0{idx + 1}
                                        </div>

                                        <div className="relative z-10">
                                            <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <IconComponent size={28} />
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 mb-3 font-serif group-hover:text-primary transition-colors">{step.title}</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-6">{step.desc}</p>
                                        </div>

                                        {/* Connector Arrow (Desktop) */}
                                        {idx < steps.length - 1 && (
                                            <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-20 text-gray-300 group-hover:text-primary transition-colors">
                                                <ArrowRight size={24} />
                                            </div>
                                        )}

                                        {/* Bottom Progress Bar */}
                                        <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full rounded-b-2xl overflow-hidden">
                                            <div className="h-full bg-primary w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                                        </div>
                                    </div>
                                </FadeIn>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ProcessSteps;
