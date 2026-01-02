import React from 'react';
import { HiPlay } from 'react-icons/hi';

const CampusSection = () => {
    return (
        <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center">
            {/* Background Image with Parallax effect placeholder (fixed attachment) */}
            <div
                className="absolute inset-0 bg-fixed bg-center bg-cover"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2586&auto=format&fit=crop')` }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Play Button */}
            <div className="relative z-10">
                <button className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-edu-red shadow-2xl hover:scale-110 transition-transform duration-300 group">
                    <HiPlay size={36} className="ml-2 group-hover:text-black transition-colors" />
                </button>
            </div>

        </section>
    );
};

export default CampusSection;
