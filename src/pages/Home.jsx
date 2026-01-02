import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Home/Hero';
import FounderMessage from '../components/Home/FounderMessage';
import Features from '../components/Home/Features';
import Academies from '../components/Home/Academies';
import News from '../components/Home/News';
import FadeIn from '../components/UI/FadeIn';
import PageLoader from '../components/UI/PageLoader';
import ErrorPage from './ErrorPage';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

const Home = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/v1/site-content/public/home`);

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
      setContent(dataMap);
    } catch (err) {
      console.error('Failed to fetch Home page content:', err);
      setError(err.message || 'Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Home | EduNet - Best School in Boston</title>
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
    <>
      <Helmet>
        <title>Home | EduNet - Best School in Boston</title>
        <meta name="description" content="EduNet is the most reputed educational institution in Boston, offering diverse academic solutions and inspiring student life." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "EduNet School",
              "url": "https://edunet-school.example.com",
              "logo": "https://edunet-school.example.com/logo.png",
              "founder": {
                "@type": "Person",
                "name": "${content.founder_message?.founder?.name || 'Founder'}"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 School Lane",
                "addressLocality": "Boston",
                "addressRegion": "MA",
                "postalCode": "02108",
                "addressCountry": "US"
              },
              "sameAs": [
                "https://www.facebook.com/edunet",
                "https://www.twitter.com/edunet",
                "https://www.linkedin.com/company/edunet"
              ]
            }
          `}
        </script>
      </Helmet>

      {content.hero && <FadeIn><Hero data={content.hero} loading={loading} /></FadeIn>}
      {content.founder_message && <FadeIn delay={100}><FounderMessage data={content.founder_message} loading={loading} /></FadeIn>}
      {content.features && <FadeIn delay={150}><Features data={content.features} loading={loading} /></FadeIn>}
      {content.academies && <FadeIn delay={200}><Academies data={content.academies} loading={loading} /></FadeIn>}
      {content.news && <FadeIn delay={250}><News data={content.news} loading={loading} /></FadeIn>}
    </>
  );
};

export default Home;
