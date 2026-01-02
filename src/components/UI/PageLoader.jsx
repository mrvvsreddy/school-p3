import React from 'react';

/**
 * Clean, minimal loading skeleton for page content
 * Use when fetching page data from the database
 */
const PageLoader = ({ className = '' }) => {
    return (
        <div className={`animate-pulse ${className}`}>
            {/* Hero Section Skeleton */}
            <div className="h-[60vh] min-h-[400px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
                <div className="container mx-auto px-4 h-full flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-2xl">
                        <div className="h-4 w-32 bg-gray-300 rounded mx-auto"></div>
                        <div className="h-12 w-96 max-w-full bg-gray-300 rounded mx-auto"></div>
                        <div className="h-6 w-80 max-w-full bg-gray-200 rounded mx-auto"></div>
                    </div>
                </div>
            </div>

            {/* Content Sections Skeleton */}
            <div className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-8 w-64 bg-gray-300 rounded"></div>
                        <div className="h-4 w-full bg-gray-100 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                        <div className="h-4 w-4/6 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Cards Skeleton */}
            <div className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                                <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                                <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shimmer Animation Styles */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .skeleton-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    );
};

/**
 * Simple inline loader for smaller sections
 */
export const SectionLoader = ({ height = 'h-64' }) => {
    return (
        <div className={`${height} bg-gray-50 animate-pulse flex items-center justify-center`}>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
};

/**
 * Minimal spinner loader
 */
export const SpinnerLoader = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-primary rounded-full animate-spin`}></div>
        </div>
    );
};

export default PageLoader;
