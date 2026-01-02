import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const FAQSection = ({ data }) => {
    const [openIndex, setOpenIndex] = useState(0);

    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const description = data.description;
    const faqs = data.faqs || [];

    if (faqs.length === 0) return null;

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    <div className="lg:w-1/3 pt-4">
                        <FadeIn className="sticky top-24">
                            {tagline && (
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="h-px w-8 bg-secondary"></span>
                                    <span className="text-secondary font-bold tracking-[0.2em] text-xs uppercase">{tagline}</span>
                                </div>
                            )}
                            {title && <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">{title}</h2>}
                            {description && <p className="text-lg text-gray-600 mb-10 leading-relaxed font-light">{description}</p>}

                            <div className="bg-primary p-8 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                        <HelpCircle size={24} className="text-white" />
                                    </div>
                                    <h4 className="font-bold text-xl mb-2 text-white">Still have questions?</h4>
                                    <p className="text-white/80 text-sm mb-6 leading-relaxed">Can't find the answer you're looking for? Please seek support from our admissions team.</p>
                                    <a href="/contact" className="inline-flex items-center gap-2 text-sm font-bold bg-white text-primary px-5 py-3 rounded-lg hover:bg-accent hover:text-gray-900 transition-colors">
                                        Contact Admissions <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                    </a>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    <div className="lg:w-2/3 w-full">
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <FadeIn key={idx} delay={idx * 50}>
                                    <div
                                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === idx ? 'bg-white border-primary shadow-lg ring-1 ring-primary/20' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200'}`}
                                    >
                                        <button
                                            className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
                                            onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                                        >
                                            <span className={`font-serif font-bold text-lg md:text-xl pr-8 ${openIndex === idx ? 'text-primary' : 'text-gray-800'}`}>
                                                {faq.question}
                                            </span>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${openIndex === idx ? 'bg-primary text-white rotate-180' : 'bg-white border border-gray-200 text-gray-400'}`}>
                                                {openIndex === idx ? <Minus size={18} /> : <Plus size={18} />}
                                            </div>
                                        </button>
                                        <div
                                            className={`transition-[max-height,opacity] duration-300 ease-in-out ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="p-6 md:p-8 pt-0 text-gray-600 leading-loose border-t border-transparent text-base font-light">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
