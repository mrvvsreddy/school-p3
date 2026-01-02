import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import FadeIn from '../UI/FadeIn';

const iconMap = {
    Phone,
    Mail,
    Clock,
    MapPin
};

const InfoGrid = ({ data }) => {
    if (!data) return null;

    const cards = data.cards || [];

    if (cards.length === 0) return null;

    const getIcon = (iconName) => iconMap[iconName] || MapPin;

    return (
        <div className="flex flex-col gap-6 pt-6">


            {cards.map((card, idx) => {
                const IconComponent = getIcon(card.icon);
                return (
                    <FadeIn key={idx} delay={idx * 100}>
                        <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex items-start gap-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150"></div>

                            <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0 relative z-10 shadow-sm">
                                <IconComponent size={24} strokeWidth={1.5} />
                            </div>

                            <div className="flex-grow relative z-10">
                                {card.title && <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{card.title}</h4>}
                                {card.lines && (
                                    <div className="text-gray-500 space-y-1">
                                        {card.lines.map((line, i) => (
                                            <p key={i} className="leading-relaxed font-medium">{line}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </FadeIn>
                );
            })}

            <FadeIn delay={400}>
                <div className="mt-8 p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -ml-16 -mb-16"></div>

                    <h4 className="text-xl font-serif font-bold mb-6 relative z-10 flex items-center gap-2 text-white">
                        <Clock size={20} className="text-primary" />
                        Office Hours
                    </h4>
                    <ul className="space-y-4 text-gray-300 relative z-10 text-sm">
                        {(data.office_hours || [
                            { day: 'Monday - Friday', time: '8:00 AM - 4:00 PM' },
                            { day: 'Saturday', time: '9:00 AM - 1:00 PM' },
                            { day: 'Sunday', time: 'Closed' }
                        ]).map((hours, idx) => (
                            <li key={idx} className="flex justify-between">
                                <span>{hours.day}</span>
                                <span className="font-medium text-white">{hours.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </FadeIn>
        </div>
    );
};

export default InfoGrid;
