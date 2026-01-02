import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, GraduationCap, Compass } from 'lucide-react';

const NotFound = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-6 overflow-hidden">
            <Helmet>
                <title>404 - Page Not Found | EduNet School</title>
            </Helmet>

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/10 via-slate-900 to-slate-900"></div>
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 text-center md:text-left"
            >
                {/* Visual Side */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <motion.div
                        variants={itemVariants}
                        className="relative"
                    >
                        <h1 className="text-[120px] sm:text-[180px] font-serif font-black leading-none text-white/5 select-none relative z-10">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/10 animate-float">
                                <Compass size={64} className="text-white" strokeWidth={1} />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Content Side */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
                    <motion.div variants={itemVariants} className="mb-6">
                        <span className="inline-block px-4 py-1.5 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm text-secondary font-bold tracking-widest text-xs uppercase mb-4">
                            Error 404
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                            Lost Your Way?
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed font-light mb-8 max-w-md">
                            The page you are looking for might have been moved, renamed, or doesn't exist. Let's get you back on track.
                        </p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <Link
                            to="/"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <Home size={20} />
                            <span>Return Home</span>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft size={20} />
                            <span>Go Back</span>
                        </button>
                    </motion.div>

                    {/* Quick Links Section */}
                    <motion.div variants={itemVariants} className="w-full border-t border-white/10 pt-8 mt-10">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">You might be looking for</p>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                            {[
                                { label: 'Admissions', path: '/admissions' },
                                { label: 'Academics', path: '/academics' },
                                { label: 'Contact', path: '/contact' },
                            ].map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-gray-300 text-sm transition-all"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
