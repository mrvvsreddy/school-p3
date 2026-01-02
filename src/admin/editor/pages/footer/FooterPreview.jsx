import React, { useMemo } from 'react';
import Footer from '../../../../components/Layout/Footer';

const FooterPreview = ({ content }) => {
    const previewData = useMemo(() => {
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
        <div className="w-full h-full overflow-y-auto bg-gray-100 flex flex-col">
            <div className="p-4 text-center text-xs text-slate-400 uppercase tracking-wider border-b bg-white">
                Live Footer Preview
            </div>

            {/* 
                Footer component has built-in padding and background. 
                We just render it here.
            */}
            <div className="flex-1 min-h-[400px]">
                <Footer previewData={previewData} />
            </div>
        </div>
    );
};

export default FooterPreview;
