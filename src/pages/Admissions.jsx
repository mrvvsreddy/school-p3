import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import AdmissionsHero from '../components/Admissions/AdmissionsHero';
import ProcessSteps from '../components/Admissions/ProcessSteps';
import RequirementsList from '../components/Admissions/RequirementsList';
import DownloadSection from '../components/Admissions/DownloadSection';
import FAQSection from '../components/Admissions/FAQSection';
import ApplyCTA from '../components/Admissions/ApplyCTA';
import PageLoader from '../components/UI/PageLoader';
import ErrorPage from './ErrorPage';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const Admissions = () => {
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

            const response = await fetch(`${API_URL}/api/v1/site-content/public/admissions`);

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
            console.error('Failed to fetch Admissions page content:', err);
            setError(err.message || 'Failed to load page content');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Admissions | EduNet School</title>
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

    return (
        <div className="bg-white min-h-screen font-sans">
            <Helmet>
                <title>Admissions | EduNet School</title>
                <meta name="description" content="Detailed guide to EduNet School's admission process, requirements, fees, and application forms for the academic year 2024-25." />
            </Helmet>

            {pageData.hero && <AdmissionsHero data={pageData.hero} />}
            {pageData.process && <ProcessSteps data={pageData.process} />}
            {pageData.requirements && <RequirementsList data={pageData.requirements} />}
            {pageData.downloads && <DownloadSection data={pageData.downloads} />}
            {pageData.faq && <FAQSection data={pageData.faq} />}
            {pageData.cta && <ApplyCTA data={pageData.cta} />}
        </div>
    );
};

export default Admissions;
