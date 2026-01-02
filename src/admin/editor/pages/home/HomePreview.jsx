import React from 'react';
import Hero from '../../../../components/Home/Hero';
import FounderMessage from '../../../../components/Home/FounderMessage';
import Features from '../../../../components/Home/Features';
import Academies from '../../../../components/Home/Academies';
import News from '../../../../components/Home/News';

// Live Preview Component - Renders home sections directly with passed content
const HomePreview = ({ content }) => {
    // Transform content array to object keyed by section_key
    const sections = {};
    if (content && Array.isArray(content)) {
        content.forEach(section => {
            sections[section.section_key] = section.content;
        });
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-gray-50 font-sans">
            {/* Hero Section Preview */}
            <div className="relative isolate">
                <Hero data={sections.hero} loading={false} />
            </div>

            {/* Founder Message Preview */}
            <div className="relative isolate">
                <FounderMessage data={sections.founder_message} loading={false} />
            </div>

            {/* Features Preview */}
            <div className="relative isolate">
                <Features data={sections.features} loading={false} />
            </div>

            {/* Academies Preview */}
            <div className="relative isolate">
                <Academies data={sections.academies} loading={false} />
            </div>

            {/* News Preview */}
            <div className="relative isolate">
                <News data={sections.news} loading={false} />
            </div>
        </div>
    );
};

export default HomePreview;
