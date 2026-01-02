import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Admissions from './pages/Admissions'
import Academics from './pages/Academics'

import Faculty from './pages/Faculty'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Overview from './pages/Overview'

import Facilities from './pages/Facilities'
import Apply from './pages/Apply'
import NotFound from './pages/NotFound'

import { DataProvider } from './context/DataContext'
import AdminLogin from './admin/Login'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Inquiries from './admin/Inquiries'
import Students from './admin/Students'
import Teachers from './admin/Teachers'
import Classes from './admin/Classes'
import Exams from './admin/Exams'

import AdmissionRequests from './admin/AdmissionRequests'
import ContactRequests from './admin/ContactRequests'
import Settings from './admin/Settings'
import Admins from './admin/Admins'
import Editor from './admin/editor'
import HomePageEditor from './admin/editor/pages/home'
import AboutPageEditor from './admin/editor/pages/about'
import AcademicsPageEditor from './admin/editor/pages/academics'
import AdmissionsPageEditor from './admin/editor/pages/admissions'
import FacilitiesPageEditor from './admin/editor/pages/facilities'
import ContactPageEditor from './admin/editor/pages/contact'
import ApplyPageEditor from './admin/editor/pages/apply'
import HeaderPageEditor from './admin/editor/pages/header'
import FooterPageEditor from './admin/editor/pages/footer'

function App() {
    return (
        <DataProvider>
            <div className="min-h-screen flex flex-col font-sans text-gray-900">
                {/* We conditionally render Header/Footer inside components or here if not admin */}
                {/* For simplicity in this structure, we'll keep Header/Footer for main site only */}
                <Routes>
                    {/* Public Website Routes */}
                    <Route path="/" element={
                        <Layout>
                            <Home />
                        </Layout>
                    } />
                    <Route path="/about" element={<Layout><About /></Layout>} />
                    <Route path="/admissions" element={<Layout><Admissions /></Layout>} />
                    <Route path="/apply" element={<Layout><Apply /></Layout>} />
                    <Route path="/academics" element={<Layout><Academics /></Layout>} />
                    <Route path="/facilities" element={<Layout><Facilities /></Layout>} />
                    <Route path="/faculty" element={<Layout><Faculty /></Layout>} />
                    <Route path="/contact" element={<Layout><Contact /></Layout>} />
                    <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                    <Route path="/overview" element={<Layout><Overview /></Layout>} />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="students" element={<Students />} />
                        <Route path="teachers" element={<Teachers />} />
                        <Route path="class" element={<Classes />} />
                        <Route path="exam" element={<Exams />} />
                        <Route path="inquiries" element={<Inquiries />} />
                        <Route path="admissions" element={<AdmissionRequests />} />
                        <Route path="contacts" element={<ContactRequests />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="admins" element={<Admins />} />
                    </Route>
                    <Route path="/admin/site-editor" element={<Editor />} />
                    <Route path="/admin/editor" element={<Editor />} />
                    <Route path="/admin/editor/home" element={<HomePageEditor />} />
                    <Route path="/admin/editor/about" element={<AboutPageEditor />} />
                    <Route path="/admin/editor/academics" element={<AcademicsPageEditor />} />
                    <Route path="/admin/editor/admissions" element={<AdmissionsPageEditor />} />
                    <Route path="/admin/editor/facilities" element={<FacilitiesPageEditor />} />
                    <Route path="/admin/editor/contact" element={<ContactPageEditor />} />
                    <Route path="/admin/editor/apply" element={<ApplyPageEditor />} />
                    <Route path="/admin/editor/header" element={<HeaderPageEditor />} />
                    <Route path="/admin/editor/footer" element={<FooterPageEditor />} />

                    {/* 404 Catch-All Route - Must be last */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </DataProvider>
    )
}

// Wrapper to show Header/Footer on public pages only
const Layout = ({ children }) => (
    <>
        <Header />
        <main className="flex-grow pt-24">
            {children}
        </main>
        <Footer />
    </>
);

export default App
