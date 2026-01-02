import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import FacilitiesHero from '../components/Facilities/FacilitiesHero';
import FacilityGrid from '../components/Facilities/FacilityGrid';
import DigitalCampus from '../components/Facilities/DigitalCampus';
import EcoInitiatives from '../components/Facilities/EcoInitiatives';
import SafetySecurity from '../components/Facilities/SafetySecurity';
import PageLoader from '../components/UI/PageLoader';
import ErrorPage from './ErrorPage';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const Facilities = () => {
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

            const response = await fetch(`${API_URL}/api/v1/site-content/public/facilities`);

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
            console.error('Failed to fetch Facilities page content:', err);
            setError(err.message || 'Failed to load page content');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Facilities | EduNet School</title>
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
        <div className="min-h-screen">
            <Helmet>
                <title>Facilities | EduNet School</title>
                <meta name="description" content="Explore our world-class facilities: Modern labs, vast library, sports complex, and a fully digital campus." />
            </Helmet>

            {pageData.hero && <FacilitiesHero data={pageData.hero} />}
            {pageData.facility_grid && <FacilityGrid data={pageData.facility_grid} />}
            {pageData.eco_initiatives && <EcoInitiatives data={pageData.eco_initiatives} />}
            {pageData.digital_campus && <DigitalCampus data={pageData.digital_campus} />}
            {pageData.safety_security && <SafetySecurity data={pageData.safety_security} />}
        </div>
    );
}

export default Facilities;
