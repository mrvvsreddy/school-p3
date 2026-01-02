import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ContactHero from '../components/Contact/ContactHero';
import ContactForm from '../components/Contact/ContactForm';
import InfoGrid from '../components/Contact/InfoGrid';
import PageLoader from '../components/UI/PageLoader';
import ErrorPage from './ErrorPage';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const Contact = () => {
    const [pageData, setPageData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPageContent();
    }, []);

    const fetchPageContent = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/v1/site-content/public/contact`);

            if (!response.ok) {
                throw new Error(`Failed to load page content (${response.status})`);
            }

            const sections = await response.json();

            if (!sections || sections.length === 0) {
                throw new Error('No content available for this page');
            }

            const dataMap = {};
            sections.forEach(section => {
                dataMap[section.section_key] = section.content;
            });
            setPageData(dataMap);
        } catch (err) {
            console.error('Failed to fetch Contact page content:', err);
            setError(err.message || 'Failed to load page content');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Contact Us | EduNet School</title>
                </Helmet>
                <PageLoader />
            </>
        );
    }

    if (error) {
        return (
            <ErrorPage
                title="Unable to Load Page"
                message={error}
                showRetry={true}
            />
        );
    }

    const mapUrl = pageData.map?.embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d94380.70293116676!2d-71.0588801!3d42.3600825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e370a5cb308779%3A0x40139b5b6329e46a!2sBoston%2C%20MA!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus";

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Contact Us | EduNet School</title>
                <meta name="description" content="Reach out to us. We are here to help with admissions, academics, and general queries." />
            </Helmet>

            {pageData.hero && <ContactHero data={pageData.hero} />}

            <div className="container mx-auto px-4 md:px-6 -mt-20 relative z-20 mb-24">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-3/5">
                        <ContactForm />
                    </div>
                    <div className="w-full lg:w-2/5">
                        {pageData.info_cards && <InfoGrid data={pageData.info_cards} />}
                    </div>
                </div>
            </div>

            {/* Full Width Map */}
            <div className="h-[400px] w-full relative">
                <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="School Location"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
            </div>
        </div>
    );
}

export default Contact;
