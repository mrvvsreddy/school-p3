import React, { useMemo } from 'react';
import Apply from '../../../../pages/Apply';

const ApplyPreview = ({ content }) => {
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
        <div className="w-full h-full overflow-y-auto bg-gray-50">
            <div className="p-4 text-center text-xs text-slate-400 uppercase tracking-wider border-b bg-gray-50">
                Live Apply Page Preview
            </div>

            {/* Render the live Apply component in preview mode */}
            <Apply data={sections} isPreview={true} />
        </div>
    );
};

export default ApplyPreview;
