import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AcademicsHero from '../components/Academics/AcademicsHero';
import CurriculumSection from '../components/Academics/CurriculumSection';
import Departments from '../components/Academics/Departments';
import Methodology from '../components/Academics/Methodology';
import PageLoader from '../components/UI/PageLoader';
import ErrorPage from './ErrorPage';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const Academics = () => {
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

            const response = await fetch(`${API_URL}/api/v1/site-content/public/academics`);

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
            console.error('Failed to fetch Academics page content:', err);
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
                    <title>Academics | EduNet School</title>
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
        <div className="min-h-screen">
            <Helmet>
                <title>Academics | EduNet School</title>
                <meta name="description" content="Explore our academic programs: Arts, Science, Business, and Engineering. Experiential learning aimed at global excellence." />
            </Helmet>

            {pageData.hero && <AcademicsHero data={pageData.hero} />}
            {pageData.curriculum && <CurriculumSection data={pageData.curriculum} />}
            {pageData.methodology && <Methodology data={pageData.methodology} />}
            {pageData.departments && <Departments data={pageData.departments} />}
        </div>
    );
}

export default Academics;
