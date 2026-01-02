import React, { useMemo } from 'react';
import Header from '../../../../components/Layout/Header';

const HeaderPreview = ({ content }) => {
    // Transform array content back to object format expected by Header
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
                Live Header Preview
            </div>

            {/* 
                Header is normally fixed. In preview, we might want to contain it.
                However, Header styles use 'fixed top-0'. 
                We can wrap it in a relative container with isolation to prevent it escaping,
                OR just let it be fixed inside this iframe/div area if possible.
                
                The Header component has 'fixed top-0 w-full z-50'. 
                To preview it correctly without it jumping to the top of the *Main Window*, 
                we might need to override the position or use an iframe.
                
                For now, we'll wrap it in a `relative` div and transform it or rely on the fact 
                that the preview area in the editor might limit it? 
                Actually, 'fixed' is relative to viewport. This might be annoying in the editor.
                
                Let's try to override the class via a wrapper prop if Header accepted it, 
                but it doesn't.
                
                Alternative: Render a "Container" that mocks the viewport. 
                OR, since we just edited Header.jsx, we could add a 'className' prop 
                to override 'fixed'.
            */}
            <div className="relative flex-1 min-h-[300px] overflow-hidden">
                {/* 
                   We need to ensure the Header doesn't stick to the top of the browser window.
                   We can trick it with a transform if we don't want to edit Header again.
                   transform creates a new containing block for fixed position elements.
                */}
                <div className="relative w-full h-full bg-white transform translate-z-0">
                    <Header previewData={previewData} />

                    {/* Fake page content to show transparency/scroll effect */}
                    <div className="pt-24 px-8 space-y-8 opacity-20">
                        <div className="h-64 bg-slate-200 rounded-xl w-full"></div>
                        <div className="space-y-4">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderPreview;
