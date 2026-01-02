import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingPage = ({ message = "Loading..." }) => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                {/* School Logo or Loading Animation */}
                <div className="relative mb-8">
                    <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Loader2 size={40} className="text-primary animate-spin" />
                    </div>
                    {/* Animated rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-4 border-primary/20 rounded-full animate-ping"></div>
                    </div>
                </div>

                <p className="text-gray-500 text-lg font-medium">{message}</p>
                <p className="text-gray-400 text-sm mt-2">Please wait...</p>
            </div>
        </div>
    );
};

export default LoadingPage;
