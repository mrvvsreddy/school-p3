import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Send, User, Users, School, BookOpen, Loader2, AlertCircle, CheckCircle2, Shield, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import FadeIn from '../components/UI/FadeIn';

const API_BASE = 'http://localhost:8000/api/v1';

// Simple rate limiting tracker
const rateLimitTracker = {
    lastSubmit: 0,
    count: 0,
    resetTime: 60000 // 1 minute
};

const Apply = ({ data = {}, isPreview = false }) => {
    // defaults
    const hero = data.hero || {};
    const studentSection = data.student_section || {};
    const parentSection = data.parent_section || {};
    const additionalSection = data.additional_section || {};
    const submitSection = data.submit_section || {};
    const successMessage = data.success_message || {};

    const [formData, setFormData] = useState({
        studentName: '',
        dob: '',
        gender: '',
        grade: '',
        fatherName: '',
        motherName: '',
        email: '',
        phone: '',
        address: '',
        previousSchool: ''
    });

    const [focused, setFocused] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const formRef = useRef(null);
    const submitTimeRef = useRef(0);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on input
    };

    // Input sanitization
    const sanitizeInput = (str) => {
        if (!str) return str;
        return str
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[<>'"]/g, '') // Remove potential XSS characters
            .trim();
    };

    // Validate form data
    const validateForm = () => {
        if (isPreview) return true; // Skip validation in preview

        // Check required fields
        if (!formData.studentName || !formData.email || !formData.phone || !formData.grade) {
            setError('Please fill in all required fields.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        }

        // Phone validation (Indian format) - simplified checking length
        const cleanPhone = formData.phone.replace(/[\s-]/g, '');
        if (cleanPhone.length < 10) {
            setError('Please enter a valid phone number.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        }

        // Rate limiting (prevent spam submissions)
        const now = Date.now();
        if (now - rateLimitTracker.lastSubmit < rateLimitTracker.resetTime) {
            rateLimitTracker.count++;
            if (rateLimitTracker.count > 3) {
                setError('Too many submissions. Please try again in a minute.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return false;
            }
        } else {
            rateLimitTracker.count = 1;
        }
        rateLimitTracker.lastSubmit = now;

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isPreview) return;

        submitTimeRef.current = Date.now();
        setError('');

        // Validate
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            // Prepare sanitized data for API
            const applicationData = {
                student_name: sanitizeInput(formData.studentName),
                parent_name: sanitizeInput(formData.fatherName || formData.motherName),
                email: sanitizeInput(formData.email).toLowerCase(),
                phone: sanitizeInput(formData.phone),
                grade_applying: formData.grade === 'KG' ? 'Kindergarten' : `Grade ${formData.grade}`,
                date_of_birth: formData.dob || null,
                address: sanitizeInput(formData.address),
                previous_school: sanitizeInput(formData.previousSchool),
                notes: `Gender: ${formData.gender}. Father: ${sanitizeInput(formData.fatherName)}. Mother: ${sanitizeInput(formData.motherName)}.`,
                status: 'pending'
            };

            const response = await fetch(`${API_BASE}/applications/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(applicationData)
            });

            if (response.ok) {
                setSubmitted(true);
                window.scrollTo(0, 0);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to submit application. Please try again.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error('Submission error:', err);
            setError('Network error. Please check your internet connection and try again.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    const InputField = ({ label, name, type = "text", icon: Icon, required = false, maxLength, ...props }) => (
        <div className="relative group">
            <div className="flex items-center gap-3 mb-2">
                {Icon && <Icon size={16} className={`text-gray-400 group-focus-within:text-primary transition-colors ${formData[name] ? 'text-primary' : ''}`} />}
                <label className="text-sm font-bold text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            </div>
            <input
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                onFocus={() => setFocused(name)}
                onBlur={() => setFocused('')}
                maxLength={maxLength}
                className={`w-full p-4 bg-gray-50 border rounded-xl outline-none transition-all duration-300 font-medium text-gray-800 ${focused === name ? 'border-primary ring-2 ring-primary/10 bg-white' : 'border-gray-200 hover:border-gray-300'
                    }`}
                {...props}
            />
        </div>
    );

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Helmet><title>{successMessage.title || "Application Submitted"} | EduNet School</title></Helmet>
                <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full relative overflow-hidden border border-gray-100">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm animate-in zoom-in duration-500">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">{successMessage.title || "Application Received!"}</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {successMessage.message || "Thank you for applying to EduNet School. We have received your details. Our admissions team will review your application and contact you shortly regarding the next steps."}
                    </p>
                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 mb-8">
                        <p className="text-sm text-green-800 font-medium flex items-center justify-center gap-2">
                            <Mail size={16} />
                            {successMessage.email_notice || "A confirmation email will be sent to"} <strong>{formData.email}</strong>
                        </p>
                    </div>
                    <a href="/" className="inline-block bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary-dark shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        {successMessage.button_text || "Return to Home"}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            <Helmet>
                <title>{hero.title || "Apply Online"} | EduNet School</title>
                <meta name="description" content="Submit your application for EduNet School online. Fast, secure, and easy process for the upcoming academic year." />
            </Helmet>

            {/* Header */}
            <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <FadeIn>
                        <span className="inline-block px-4 py-1.5 border border-white/20 rounded-full bg-white/5 backdrop-blur-sm mb-6 text-secondary font-bold tracking-[0.2em] text-xs uppercase">
                            {hero.badge || 'Admissions Open 2024-25'}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white tracking-tight">{hero.title || "Online Application"}</h1>
                        <p className="text-gray-300 max-w-xl mx-auto text-lg leading-relaxed font-light">
                            {hero.subtitle || "Take the first step towards a bright future. Please fill out the form below accurately to begin your journey with us."}
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <FadeIn delay={200}>
                    <form ref={formRef} onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

                        {/* Progress/Steps Indicator (Visual only) */}
                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:flex">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">1</span>
                                {studentSection.title || "Student Details"}
                            </div>
                            <div className="h-px bg-gray-200 flex-grow mx-4"></div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">2</span>
                                {parentSection.title || "Parent Details"}
                            </div>
                            <div className="h-px bg-gray-200 flex-grow mx-4"></div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">3</span>
                                Review & Submit
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <AlertCircle size={20} className="text-red-500 shrink-0" />
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Section 1: Student Details */}
                        <div className="p-8 md:p-12 border-b border-gray-100">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                                    <User size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{studentSection.title || "Student Details"}</h2>
                                    <p className="text-sm text-gray-500">{studentSection.subtitle || "Personal information of the applicant"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField
                                    label="Full Name"
                                    name="studentName"
                                    required
                                    maxLength={100}
                                    placeholder="e.g. Aarav Sharma"
                                    icon={User}
                                />
                                <InputField
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    icon={Calendar}
                                />

                                <div className="relative group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users size={16} className={`text-gray-400 group-focus-within:text-primary transition-colors ${formData.gender ? 'text-primary' : ''}`} />
                                        <label className="text-sm font-bold text-gray-700">Gender <span className="text-red-500">*</span></label>
                                    </div>
                                    <select
                                        required
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('gender')}
                                        onBlur={() => setFocused('')}
                                        className={`w-full p-4 bg-gray-50 border rounded-xl outline-none transition-all duration-300 font-medium text-gray-800 ${focused === 'gender' ? 'border-primary ring-2 ring-primary/10 bg-white' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="relative group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <School size={16} className={`text-gray-400 group-focus-within:text-primary transition-colors ${formData.grade ? 'text-primary' : ''}`} />
                                        <label className="text-sm font-bold text-gray-700">Applying For Grade <span className="text-red-500">*</span></label>
                                    </div>
                                    <select
                                        required
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('grade')}
                                        onBlur={() => setFocused('')}
                                        className={`w-full p-4 bg-gray-50 border rounded-xl outline-none transition-all duration-300 font-medium text-gray-800 ${focused === 'grade' ? 'border-primary ring-2 ring-primary/10 bg-white' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Grade</option>
                                        {studentSection.grades && studentSection.grades.length > 0 ? (
                                            studentSection.grades.map((grade, i) => (
                                                <option key={grade._id || i} value={grade.value}>{grade.label}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="KG">Kindergarten (KG)</option>
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Parent Details */}
                        <div className="p-8 md:p-12 border-b border-gray-100 bg-gray-50/30">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-sm">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{parentSection.title || "Parent Details"}</h2>
                                    <p className="text-sm text-gray-500">{parentSection.subtitle || "Guardian contact information"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField
                                    label="Father's Name"
                                    name="fatherName"
                                    required
                                    maxLength={100}
                                    icon={User}
                                />
                                <InputField
                                    label="Mother's Name"
                                    name="motherName"
                                    required
                                    maxLength={100}
                                    icon={User}
                                />
                                <InputField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    required
                                    maxLength={100}
                                    icon={Mail}
                                />
                                <InputField
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    required
                                    maxLength={15}
                                    placeholder="+91"
                                    icon={Phone}
                                />
                            </div>
                        </div>

                        {/* Section 3: Additional Info */}
                        <div className="p-8 md:p-12">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 shadow-sm">
                                    <BookOpen size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{additionalSection.title || "Additional Information"}</h2>
                                    <p className="text-sm text-gray-500">{additionalSection.subtitle || "Address and academic background"}</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <InputField
                                    label="Previous School (if applicable)"
                                    name="previousSchool"
                                    maxLength={200}
                                    icon={School}
                                />

                                <div className="relative group">
                                    <div className="flex items-center gap-3 mb-2">
                                        <MapPin size={16} className={`text-gray-400 group-focus-within:text-primary transition-colors ${formData.address ? 'text-primary' : ''}`} />
                                        <label className="text-sm font-bold text-gray-700">Residential Address <span className="text-red-500">*</span></label>
                                    </div>
                                    <textarea
                                        required
                                        name="address"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        onFocus={() => setFocused('address')}
                                        onBlur={() => setFocused('')}
                                        maxLength={500}
                                        className={`w-full p-4 bg-gray-50 border rounded-xl outline-none transition-all duration-300 font-medium text-gray-800 resize-none ${focused === 'address' ? 'border-primary ring-2 ring-primary/10 bg-white' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Submit Bar */}
                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <Shield size={14} className="text-green-500" />
                                <span>{hero.security_text || "SSL Encrypted. Your data is secure."}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting || isPreview}
                                className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {submitSection.button_text || "Submit Application"}
                                        <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </FadeIn>
            </div>
        </div>
    );
};

export default Apply;
