import React, { useMemo } from 'react';
import AdmissionsHero from '../../../../components/Admissions/AdmissionsHero';
import ProcessSteps from '../../../../components/Admissions/ProcessSteps';
import RequirementsList from '../../../../components/Admissions/RequirementsList';
import DownloadSection from '../../../../components/Admissions/DownloadSection';
import FAQSection from '../../../../components/Admissions/FAQSection';
import ApplyCTA from '../../../../components/Admissions/ApplyCTA';

const AdmissionsPreview = ({ content }) => {
    // Transform content array to object keyed by section_key
    const sectionData = useMemo(() => {
        if (!content || !Array.isArray(content)) return {};
        const dataMap = {};
        content.forEach(section => {
            let parsedContent = section.content;
            if (typeof parsedContent === 'string') {
                try {
                    parsedContent = JSON.parse(parsedContent);
                } catch (e) {
                    parsedContent = {};
                }
            }
            dataMap[section.section_key] = parsedContent || {};
        });
        return dataMap;
    }, [content]);

    return (
        <div className="w-full h-full overflow-y-auto bg-white">
            <div className="p-4 text-center text-xs text-slate-400 uppercase tracking-wider border-b bg-gray-50">
                Live Admissions Page Preview
            </div>

            <div className="flex flex-col">
                <AdmissionsHero data={sectionData.hero} />
                <ProcessSteps data={sectionData.process} />
                <RequirementsList data={sectionData.requirements} />
                <DownloadSection data={sectionData.downloads} />
                <FAQSection data={sectionData.faq} />
                <ApplyCTA data={sectionData.cta} />
            </div>
        </div>
    );
};

export default AdmissionsPreview;
