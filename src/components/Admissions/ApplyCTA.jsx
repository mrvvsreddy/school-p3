import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const ApplyCTA = ({ data }) => {
    if (!data) return null;

    return (
        <section className="py-32 bg-primary text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full mix-blend-overlay opacity-10 blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent rounded-full mix-blend-overlay opacity-20 blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                <FadeIn>
                    <div className="inline-block p-4 rounded-full bg-white/10 mb-8 backdrop-blur-sm border border-white/20">
                        <ArrowRight size={32} className="text-accent rotate-[-45deg]" />
                    </div>

                    {data.title && <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-8 text-white tracking-tight drop-shadow-2xl max-w-5xl mx-auto leading-tight">{data.title}</h2>}

                    {data.subtitle && (
                        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                            {data.subtitle}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        {data.apply_button_text && (
                            <Link
                                to={data.apply_button_link || '/apply'}
                                className="group relative px-10 py-5 bg-white text-primary font-bold text-lg rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-3"
                            >
                                <span className="relative z-10 flex items-center gap-2 tracking-wide">
                                    {data.apply_button_text}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent opacity-50 group-hover:animate-shimmer transform -skew-x-12"></div>
                            </Link>
                        )}

                        {data.contact_button_text && (
                            <Link
                                to={data.contact_button_link || '/contact'}
                                className="group px-10 py-5 bg-transparent border-2 border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 backdrop-blur-md tracking-wide"
                            >
                                <Phone size={20} className="group-hover:rotate-12 transition-transform" />
                                {data.contact_button_text}
                            </Link>
                        )}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
};

export default ApplyCTA;
