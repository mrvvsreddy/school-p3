import React, { useMemo } from 'react';
import ContactHero from '../../../../components/Contact/ContactHero';
import ContactForm from '../../../../components/Contact/ContactForm';
import InfoGrid from '../../../../components/Contact/InfoGrid';

const ContactPreview = ({ content }) => {
    // Parse content sections
    const sections = useMemo(() => {
        const map = {};
        if (!content || !Array.isArray(content)) return map;

        content.forEach(section => {
            let parsedContent = section.content;
            if (typeof parsedContent === 'string') {
                try {
                    parsedContent = JSON.parse(parsedContent);
                } catch { parsedContent = {}; }
            }
            map[section.section_key] = parsedContent || {};
        });
        return map;
    }, [content]);

    const hero = sections.hero || {};
    const infoCards = sections.info_cards || {};
    const formSettings = sections.form_settings || {};
    const mapData = sections.map || {};

    const mapUrl = mapData.embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d94380.70293116676!2d-71.0588801!3d42.3600825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e370a5cb308779%3A0x40139b5b6329e46a!2sBoston%2C%20MA!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus";

    return (
        <div className="w-full h-full overflow-y-auto bg-gray-50 overflow-x-hidden">
            <div className="p-4 text-center text-xs text-slate-400 uppercase tracking-wider border-b bg-gray-50">
                Live Contact Page Preview
            </div>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Hero Section */}
                <ContactHero data={hero} />

                {/* Main Content Area */}
                <div className="container mx-auto px-4 md:px-6 -mt-20 relative z-20 mb-24">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left: Form */}
                        <div className="w-full lg:w-3/5">
                            <ContactForm data={formSettings} />
                        </div>

                        {/* Right: Info Cards */}
                        <div className="w-full lg:w-2/5">
                            <InfoGrid data={infoCards} />
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="w-full relative" style={{ height: mapData.height || '400px' }}>
                    <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        title="School Location"
                        className="grayscale hover:grayscale-0 transition-all duration-500"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default ContactPreview;
