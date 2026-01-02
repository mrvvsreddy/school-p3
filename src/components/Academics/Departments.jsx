import React from 'react';
import FadeIn from '../UI/FadeIn';
import { Microscope, Palette, Briefcase, Globe, Code, Music } from 'lucide-react';

// Icon mapping
const iconMap = {
    Microscope,
    Code,
    Briefcase,
    Palette,
    Globe,
    Music
};

const Departments = ({ data }) => {
    // If no data or no departments, don't render
    if (!data || !data.departments || data.departments.length === 0) return null;

    const departments = data.departments;

    return (
        <section className="py-24 bg-white text-slate-900 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <FadeIn>
                        {data.tagline && (
                            <div className="inline-block px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full mb-6">
                                <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">{data.tagline}</span>
                            </div>
                        )}
                        {data.title && (
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">{data.title}</h2>
                        )}
                        <p className="text-gray-500 text-lg font-light leading-relaxed">
                            Our academic structure is divided into specialized departments, each dedicated to fostering excellence and innovation in its field.
                        </p>
                    </FadeIn>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {departments.map((dept, index) => {
                        const IconComp = iconMap[dept.icon] || Microscope;
                        const hasCustomIcon = dept.customIcon && dept.customIcon.trim() !== '';

                        return (
                            <FadeIn key={index} delay={index * 50} className="h-full">
                                <div className="group h-full bg-white border border-gray-100 p-8 rounded-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden flex flex-col hover:border-primary/20">
                                    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        {hasCustomIcon ? (
                                            <img
                                                src={dept.customIcon}
                                                alt={dept.name || 'Department'}
                                                className="w-8 h-8 object-contain"
                                                onError={(e) => { e.target.style.display = 'none' }}
                                            />
                                        ) : (
                                            <IconComp size={32} strokeWidth={1.5} />
                                        )}
                                    </div>

                                    {dept.name && (
                                        <h3 className="text-2xl font-serif font-bold mb-4 text-slate-900 group-hover:text-primary transition-colors">
                                            {dept.name}
                                        </h3>
                                    )}

                                    {dept.desc && (
                                        <p className="text-gray-500 leading-relaxed font-medium mb-8 flex-grow">
                                            {dept.desc}
                                        </p>
                                    )}

                                    <div className="flex items-center text-sm font-bold text-primary uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                                        Explore <span className="ml-2">→</span>
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

export default Departments;
