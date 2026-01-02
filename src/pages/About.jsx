import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AboutHero from '../components/About/AboutHero';
import MissionVision from '../components/About/MissionVision';
import Timeline from '../components/About/Timeline';
import Leadership from '../components/About/Leadership';
import CampusGallery from '../components/About/CampusGallery';
import PageLoader from '../components/UI/PageLoader';
import ErrorPage from './ErrorPage';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const About = () => {
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

            const response = await fetch(`${API_URL}/api/v1/site-content/public/about`);

            if (!response.ok) {
                throw new Error(`Failed to load page content (${response.status})`);
            }

            const sections = await response.json();

            if (!sections || sections.length === 0) {
                throw new Error('No content available for this page');
            }

            // Transform array to object keyed by section_key
            const dataMap = {};
            sections.forEach(section => {
                dataMap[section.section_key] = section.content;
            });
            setPageData(dataMap);
        } catch (err) {
            console.error('Failed to fetch About page content:', err);
            setError(err.message || 'Failed to load page content');
        } finally {
            setLoading(false);
        }
    };

    // Show loading skeleton
    if (loading) {
        return (
            <>
                <Helmet>
                    <title>About Us | EduNet School</title>
                </Helmet>
                <PageLoader />
            </>
        );
    }

    // Show error state
    if (error) {
        return (
            <ErrorPage
                title="Unable to Load Page"
                message={error}
                showRetry={true}
            />
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans">
            <Helmet>
                <title>About Us | EduNet School</title>
                <meta name="description" content="Discover EduNet School's legacy of excellence, our visionary leadership, and our commitment to shaping global citizens since 1985." />
            </Helmet>

            {pageData.hero && <AboutHero data={pageData.hero} />}
            {pageData.mission_vision && <MissionVision data={pageData.mission_vision} />}
            {pageData.timeline && <Timeline data={pageData.timeline} />}
            {pageData.leadership && <Leadership data={pageData.leadership} />}
            {pageData.campus_gallery && <CampusGallery data={pageData.campus_gallery} />}
        </div>
    );
};

export default About;
