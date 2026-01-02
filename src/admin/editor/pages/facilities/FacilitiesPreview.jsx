import React, { useMemo } from 'react';
import FacilitiesHero from '../../../../components/Facilities/FacilitiesHero';
import FacilityGrid from '../../../../components/Facilities/FacilityGrid';
import EcoInitiatives from '../../../../components/Facilities/EcoInitiatives';
import DigitalCampus from '../../../../components/Facilities/DigitalCampus';
import SafetySecurity from '../../../../components/Facilities/SafetySecurity';

const FacilitiesPreview = ({ content }) => {
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

    return (
        <div className="w-full h-full overflow-y-auto bg-white overflow-x-hidden">
            <div className="p-4 text-center text-xs text-slate-400 uppercase tracking-wider border-b bg-gray-50">
                Live Facilities Page Preview
            </div>

            <div className="flex flex-col">
                <FacilitiesHero data={sections.hero} />
                <FacilityGrid data={sections.facility_grid} />
                <EcoInitiatives data={sections.eco_initiatives} />
                <DigitalCampus data={sections.digital_campus} />
                <SafetySecurity data={sections.safety_security} />
            </div>
        </div>
    );
};

export default FacilitiesPreview;
