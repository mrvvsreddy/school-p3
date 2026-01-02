import React from 'react';
import FadeIn from '../UI/FadeIn';

const AdmissionsHero = ({ data }) => {
    if (!data) return null;

    return (
        <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-slate-900">
            <div className="absolute inset-0 z-0">
                <img
                    src={data.image}
                    alt="Admissions"
                    className="w-full h-full object-cover opacity-50"
                    onError={(e) => { e.target.src = 'https://placehold.co/1920x900/580000/white?text=Admissions' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-slate-900/80 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center text-white max-w-4xl">
                <FadeIn delay={0}>
                    {data.tagline && (
                        <div className="inline-flex items-center gap-3 mb-6">
                            <span className="w-8 h-[2px] bg-secondary"></span>
                            <span className="text-secondary font-bold tracking-[0.2em] text-sm uppercase">{data.tagline}</span>
                            <span className="w-8 h-[2px] bg-secondary"></span>
                        </div>
                    )}

                    {data.title && (
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black mb-8 text-white tracking-tight leading-none">
                            {data.title}
                        </h1>
                    )}

                    {data.subtitle && (
                        <p className="text-xl md:text-2xl text-gray-100 font-light leading-relaxed mb-8">
                            {data.subtitle}
                        </p>
                    )}

                    <div className="flex justify-center gap-4">
                        <a
                            href={data.apply_button_url || "/apply"}
                            className="px-8 py-4 bg-secondary text-primary-dark font-bold rounded-full text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            {data.apply_button_text || "Apply Now"}
                        </a>
                    </div>
                </FadeIn>
            </div>

            {/* Decorative bottom curve */}
            <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-none rotate-180">
                <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
                </svg>
            </div>
        </div>
    );
};

export default AdmissionsHero;
