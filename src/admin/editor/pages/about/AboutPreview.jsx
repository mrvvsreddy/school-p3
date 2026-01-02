import React, { useMemo } from 'react';
import AboutHero from '../../../../components/About/AboutHero';
import MissionVision from '../../../../components/About/MissionVision';
import Timeline from '../../../../components/About/Timeline';
import Leadership from '../../../../components/About/Leadership';
import CampusGallery from '../../../../components/About/CampusGallery';

const AboutPreview = ({ content }) => {
    // Transform content array to object
    const sections = useMemo(() => {
        const map = {};
        if (!content || !Array.isArray(content)) return map;

        content.forEach(section => {
            let parsedContent = section.content;
            if (typeof parsedContent === 'string') {
                try { parsedContent = JSON.parse(parsedContent); } catch { parsedContent = {}; }
            }
            map[section.section_key] = parsedContent || {};
        });
        return map;
    }, [content]);

    return (
        <div className="w-full h-full overflow-y-auto bg-white overflow-x-hidden">
            <div className="p-4 text-center text-xs text-slate-400 uppercase tracking-wider border-b bg-gray-50">
                Live About Page Preview
            </div>

            <div className="flex flex-col">
                <AboutHero data={sections.hero} />
                <MissionVision data={sections.mission_vision} />
                <Timeline data={sections.timeline} />
                <Leadership data={sections.leadership} />
                <CampusGallery data={sections.campus_gallery} />
            </div>
        </div>
    );
};

export default AboutPreview;
