import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    Home, Info, GraduationCap, FileText, BookOpen,
    Building2, Users, MapPin, Shield, LayoutDashboard,
    UserCog, School, ClipboardCheck, MessageSquare,
    Settings, Edit3, Globe, Lock
} from 'lucide-react';

const Overview = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    const categories = [
        {
            title: "Public Website",
            description: "Main facing pages accessible to all visitors",
            icon: Globe,
            links: [
                { name: "Home", path: "/", icon: Home, desc: "Landing page with hero, features, and news" },
                { name: "About Us", path: "/about", icon: Info, desc: "School history, mission, and vision" },
                { name: "Admissions", path: "/admissions", icon: UserCog, desc: "Admission process and guidelines" },
                { name: "Apply Now", path: "/apply", icon: FileText, desc: "Online application form" },
                { name: "Academics", path: "/academics", icon: BookOpen, desc: "Curriculum and academic programs" },
                { name: "Facilities", path: "/facilities", icon: Building2, desc: "Campus infrastructure tour" },
                { name: "Faculty", path: "/faculty", icon: Users, desc: "Teachers and staff profiles" },
                { name: "Contact", path: "/contact", icon: MapPin, desc: "Contact info and inquiry form" },
                { name: "Privacy Policy", path: "/privacy", icon: Shield, desc: "Data protection policy" },
            ]
        },
        {
            title: "Admin Portal",
            description: "Protected area for school management",
            icon: Lock,
            links: [
                { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, desc: "Overview stats and quick actions" },
                { name: "Students", path: "/admin/students", icon: Users, desc: "Student records management" },
                { name: "Teachers", path: "/admin/teachers", icon: UserCog, desc: "Staff management" },
                { name: "Classes", path: "/admin/class", icon: School, desc: "Class and section management" },
                { name: "Exams", path: "/admin/exam", icon: ClipboardCheck, desc: "Examination scheduling and results" },
                { name: "Inquiries", path: "/admin/inquiries", icon: MessageSquare, desc: "General inquiries from website" },
                { name: "Admission Requests", path: "/admin/admissions", icon: FileText, desc: "Incoming student applications" },
                { name: "Contact Messages", path: "/admin/contacts", icon: MessageSquare, desc: "Messages from contact form" },
                { name: "Settings", path: "/admin/settings", icon: Settings, desc: "System configuration" },
                { name: "Manage Admins", path: "/admin/admins", icon: Shield, desc: "Admin user access control" },
            ]
        },
        {
            title: "School CMS",
            description: "Content Management System for website pages",
            icon: Edit3,
            links: [
                { name: "Site Editor Hub", path: "/admin/editor", icon: Edit3, desc: "Central hub for all page editors" },
                { name: "Home Editor", path: "/admin/editor/home", icon: Home, desc: "Edit homepage content" },
                { name: "About Editor", path: "/admin/editor/about", icon: Info, desc: "Edit about page content" },
                { name: "Academics Editor", path: "/admin/editor/academics", icon: BookOpen, desc: "Edit academics content" },
                { name: "Admissions Editor", path: "/admin/editor/admissions", icon: GraduationCap, desc: "Edit admissions content" },
                { name: "Facilities Editor", path: "/admin/editor/facilities", icon: Building2, desc: "Edit facilities content" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#FCFCFC] py-16 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>Site Overview | EduNet School</title>
            </Helmet>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
                        System Overview
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        A comprehensive map of all modules, pages, and functions available in the EduNet ecosystem.
                    </motion.p>
                    <motion.div variants={itemVariants} className="h-1 w-24 bg-primary mx-auto rounded-full" />
                </div>

                {/* Categories */}
                <div className="space-y-16">
                    {categories.map((category, catIdx) => (
                        <motion.section key={catIdx} variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
                                <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                    <category.icon size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-gray-900">{category.title}</h2>
                                    <p className="text-gray-500">{category.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {category.links.map((link, linkIdx) => (
                                    <Link
                                        key={linkIdx}
                                        to={link.path}
                                        className="group block p-6 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-lg bg-white text-gray-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors shadow-sm">
                                                <link.icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-1">
                                                    {link.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 group-hover:text-gray-600">
                                                    {link.desc}
                                                </p>
                                                <div className="mt-4 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                    View Page →
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.section>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Overview;
