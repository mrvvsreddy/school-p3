import React from 'react';
import { Helmet } from 'react-helmet-async';

const Faculty = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Helmet>
                <title>Faculty | EduNet School</title>
                <meta name="description" content="Meet our experienced and dedicated faculty members." />
            </Helmet>

            <div className="bg-primary text-white py-16">
                <div className="container mx-auto px-4 md:px-6">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Faculty</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-12">
                <p className="text-gray-700 mb-8">Guided by experts, inspired by passion.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-sm shadow-sm text-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                            <h3 className="font-bold text-lg font-serif">Faculty Name {i}</h3>
                            <p className="text-sm text-primary uppercase font-bold tracking-wider">Department</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Faculty;
