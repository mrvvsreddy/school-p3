import React, { useState } from 'react';
import FadeIn from '../UI/FadeIn';
import { BookOpen, Star, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

// Icon mapping
const iconMap = {
    Star,
    Compass,
    BookOpen
};

const CurriculumSection = ({ data }) => {
    const [activeTab, setActiveTab] = useState(null);

    // If no data or no curricula, don't render
    if (!data || !data.curricula) return null;

    const curricula = data.curricula;
    const curriculumKeys = Object.keys(curricula);

    // Set initial active active tab if not set
    const currentTab = activeTab && curriculumKeys.includes(activeTab)
        ? activeTab
        : curriculumKeys[0];

    const activeData = curricula[currentTab];
    if (!activeData) return null;

    // Get icon component
    const ActiveIcon = iconMap[activeData.icon] || Star;

    // Get features (handle both array of strings and array of objects)
    const features = activeData.features?.map(f => typeof f === 'string' ? f : f.text) || [];

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    {data.tagline && (
                        <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-3 block">{data.tagline}</span>
                    )}
                    {data.title && (
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">{data.title}</h2>
                    )}
                </div>

                {/* Horizontal Tabs Navigation */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    {curriculumKeys.map((key) => {
                        const curr = curricula[key];
                        if (!curr) return null;

                        const isActive = currentTab === key;
                        const titleParts = curr.title?.split('(') || [key];
                        const name = titleParts[0]?.trim();

                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 border-2 ${isActive
                                        ? 'bg-primary border-primary text-white shadow-lg scale-105'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30 hover:text-primary'
                                    }`}
                            >
                                {name || 'Curriculum'}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area - Card Style */}
                <div className="relative">
                    <FadeIn key={currentTab} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2">

                            {/* Left Content */}
                            <div className="p-10 lg:p-16 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                                        <ActiveIcon size={28} />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-serif font-bold text-slate-900">
                                        {activeData.title}
                                    </h3>
                                </div>

                                {activeData.description && (
                                    <p className="text-gray-600 mb-10 leading-relaxed text-lg font-light">
                                        {activeData.description}
                                    </p>
                                )}

                                {features.length > 0 && (
                                    <div className="space-y-4">
                                        {features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-4 group">
                                                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                                <span className="text-gray-700 font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Image */}
                            <div className="relative min-h-[400px] lg:min-h-full">
                                {activeData.image ? (
                                    <>
                                        <img
                                            src={activeData.image}
                                            alt={activeData.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-300">
                                        <BookOpen size={64} />
                                    </div>
                                )}
                            </div>

                        </div>
                    </FadeIn>
                </div>

            </div>
        </section>
    );
};

export default CurriculumSection;
