import React from 'react';
import { Calendar, ArrowRight, Bell } from 'lucide-react';

const News = ({ data, loading }) => {
    // If loading or no data, don't render
    if (loading || !data) return null;

    const items = data.items || [];
    if (items.length === 0) return null;

    // Split items into main feature and side list
    const mainStory = items[0];
    const sideStories = items.slice(1, 4);

    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header with 'Live' indicator */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-2 border-primary/5 pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            Announcements Feed
                        </div>
                        {data.title && (
                            <h2 className="text-4xl lg:text-5xl font-serif font-black text-gray-900 leading-tight">
                                {data.title}
                            </h2>
                        )}
                    </div>

                    {data.link && (
                        <button className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">
                            View All Updates <ArrowRight size={16} />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Main Story Card (Large) */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <div className="group relative h-full min-h-[400px] rounded-[2rem] overflow-hidden cursor-pointer">
                            <div className="absolute inset-0">
                                {mainStory.image && (
                                    <img
                                        src={mainStory.image}
                                        alt={mainStory.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => { e.target.src = 'https://placehold.co/800x600/6d0b1a/white?text=Top+News' }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                            </div>

                            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-md">
                                        Featured
                                    </span>
                                    {mainStory.date && (
                                        <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                            <Calendar size={14} /> {mainStory.date} {mainStory.month}
                                        </span>
                                    )}
                                </div>

                                {mainStory.title && (
                                    <h3 className="text-2xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight group-hover:text-secondary transition-colors">
                                        {mainStory.title}
                                    </h3>
                                )}

                                {mainStory.subtitle && (
                                    <p className="text-gray-300 line-clamp-2 max-w-2xl text-lg">
                                        {mainStory.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Side Feed (Scrollable/Stacked) */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                            <Bell size={14} /> Recent Updates
                        </div>

                        {sideStories.map((story, index) => (
                            <div key={index} className="group flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 border border-transparent hover:border-gray-100 cursor-pointer">
                                {/* Date Box */}
                                <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl flex flex-col items-center justify-center border border-gray-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                                    <span className="text-xs font-bold text-gray-400 uppercase">{story.month?.substring(0, 3)}</span>
                                    <span className="text-xl font-bold text-gray-900 font-serif">{story.date}</span>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <h4 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                        {story.title}
                                    </h4>
                                    <div className="text-xs text-secondary font-bold uppercase tracking-wider mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-1 group-hover:translate-y-0">
                                        Read More
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* More Link for Mobile */}
                        {data.link && (
                            <button className="md:hidden w-full py-4 mt-4 rounded-xl bg-gray-100 text-gray-600 font-bold uppercase text-xs tracking-widest hover:bg-gray-200">
                                View All News
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default News;
