import React, { useState, useMemo } from 'react';
import AcademicsHero from '../../../../components/Academics/AcademicsHero';
import CurriculumSection from '../../../../components/Academics/CurriculumSection';
import Departments from '../../../../components/Academics/Departments';
import Methodology from '../../../../components/Academics/Methodology';

const AcademicsPreview = ({ content }) => {
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
                Live Academics Page Preview
            </div>

            <div className="flex flex-col">
                <AcademicsHero data={sections.hero} />
                <CurriculumSection data={sections.curriculum} />
                <Methodology data={sections.methodology} />
                <Departments data={sections.departments} />
            </div>
        </div>
    );
};

export default AcademicsPreview;
