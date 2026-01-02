import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, Mail, ShieldAlert } from 'lucide-react';

const ErrorPage = ({
    title = "Something Went Wrong",
    message = "We encountered an unexpected error. Please try again later.",
    showRetry = true,
    errorCode = null
}) => {
    const handleRetry = () => {
        window.location.reload();
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-6 overflow-hidden">
            <Helmet>
                <title>Error | EduNet School</title>
            </Helmet>

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-100/50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-1/2 -left-24 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl opacity-50"></div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-lg bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 text-center"
            >
                {/* Icon */}
                <motion.div
                    variants={itemVariants}
                    className="w-24 h-24 mx-auto mb-8 relative"
                >
                    <div className="absolute inset-0 bg-red-50 rounded-full animate-ping opacity-75" />
                    <div className="relative bg-white border-4 border-red-50 rounded-full w-full h-full flex items-center justify-center text-red-500 shadow-sm">
                        <AlertTriangle size={40} strokeWidth={1.5} />
                    </div>
                </motion.div>

                {/* Error Code Tag */}
                {errorCode && (
                    <motion.div variants={itemVariants} className="mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-mono text-sm uppercase tracking-wider font-bold border border-red-100">
                            <ShieldAlert size={14} />
                            Code: {errorCode}
                        </span>
                    </motion.div>
                )}

                {/* Content */}
                <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
                    {title}
                </motion.h1>

                <motion.p variants={itemVariants} className="text-slate-500 text-lg mb-10 leading-relaxed font-light">
                    {message}
                </motion.p>

                {/* Actions */}
                <motion.div variants={itemVariants} className="space-y-4">
                    {showRetry && (
                        <button
                            onClick={handleRetry}
                            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <RefreshCw size={20} className="stroke-2" />
                            <span>Try Again</span>
                        </button>
                    )}

                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-100 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all"
                    >
                        <Home size={20} className="stroke-2" />
                        <span>Return Home</span>
                    </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-10 pt-8 border-t border-slate-50">
                    <p className="text-slate-400 text-sm mb-2">Need help?</p>
                    <button
                        onClick={() => window.location.href = "mailto:support@edunet.com"}
                        className="text-primary hover:text-primary-dark font-semibold transition-colors flex items-center justify-center gap-2 mx-auto group"
                    >
                        <Mail size={16} />
                        <span>Contact Support System</span>
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ErrorPage;
