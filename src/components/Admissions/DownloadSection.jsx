import React from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const DownloadSection = ({ data }) => {
    if (!data) return null;

    const tagline = data.tagline;
    const title = data.title;
    const documents = data.documents || [];

    if (documents.length === 0) return null;

    const handleDownload = (url) => {
        if (url && url !== '#') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <section className="py-24 bg-white relative border-t border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <FadeIn className="text-center mb-16">
                    {tagline && (
                        <div className="inline-block px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full mb-4">
                            <span className="text-secondary font-bold tracking-widest text-xs uppercase">{tagline}</span>
                        </div>
                    )}
                    {title && <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">{title}</h2>}
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {documents.map((doc, idx) => (
                        <FadeIn key={idx} delay={idx * 100} className="group h-full">
                            <div
                                onClick={() => handleDownload(doc.url)}
                                className="bg-white p-0 rounded-2xl border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] h-full flex flex-col relative overflow-hidden cursor-pointer group hover:border-primary/30"
                            >
                                <div className="p-8 pb-4 flex items-center justify-between">
                                    <div className="w-14 h-14 bg-gray-50 border border-gray-100 text-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <FileText size={28} strokeWidth={1.5} />
                                    </div>
                                    {doc.size && (
                                        <div className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider border border-gray-100 group-hover:border-primary/10 group-hover:text-primary transition-colors">
                                            {doc.size}
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 pt-4 flex-grow">
                                    {doc.title && <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors">{doc.title}</h3>}
                                    {doc.desc && <p className="text-sm text-gray-500 leading-relaxed font-medium">{doc.desc}</p>}
                                </div>

                                <div className="bg-gray-50 p-4 flex items-center justify-center border-t border-gray-100 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <div className="text-sm font-bold flex items-center gap-2">
                                        Download PDF <Download size={16} />
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DownloadSection;
