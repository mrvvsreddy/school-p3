import React from 'react';
import { Helmet } from 'react-helmet-async';

const Privacy = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <Helmet>
                <title>Privacy Policy | EduNet School</title>
            </Helmet>
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4">At EduNet School, we value your privacy...</p>
            {/* Standard dummy content */}
            <p>We collect information to provide better services...</p>
        </div>
    );
};
export default Privacy;
