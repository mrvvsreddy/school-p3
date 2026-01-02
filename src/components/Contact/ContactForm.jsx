import React, { useState } from 'react';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/v1';

const ContactForm = () => {
    const [focused, setFocused] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: 'admission',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const sanitizeInput = (str) => {
        if (!str) return str;
        return str.replace(/<[^>]*>/g, '').replace(/[<>'"]/g, '').trim();
    };

    const validateForm = () => {
        if (!formData.firstName || !formData.email || !formData.message) {
            setError('Please fill in all required fields.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setSubmitting(true);

        try {
            const contactData = {
                name: sanitizeInput(`${formData.firstName} ${formData.lastName}`.trim()),
                email: sanitizeInput(formData.email).toLowerCase(),
                dial_code: '+91',
                phone: sanitizeInput(formData.phone),
                subject: formData.subject,
                message: sanitizeInput(formData.message),
                status: 'new'
            };

            const response = await fetch(`${API_BASE}/contacts/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contactData)
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    subject: 'admission',
                    message: ''
                });
                setTimeout(() => setSubmitted(false), 4000);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to send message. Please try again.');
            }
        } catch (err) {
            console.error('Contact form error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const InputField = ({ label, name, type = "text", required = false, maxLength, ...props }) => (
        <div className="relative group">
            <input
                name={name}
                type={type}
                value={formData[name]}
                onChange={handleChange}
                onFocus={() => setFocused(name)}
                onBlur={(e) => !e.target.value && setFocused('')}
                maxLength={maxLength}
                className={`w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-medium text-slate-900 placeholder-transparent ${focused === name || formData[name] ? 'bg-white' : ''}`}
                placeholder={label}
                {...props}
            />
            <label
                className={`absolute left-5 transition-all duration-200 pointer-events-none ${focused === name || formData[name]
                    ? '-top-2.5 bg-white px-2 text-xs text-primary font-bold tracking-wide'
                    : 'top-4 text-gray-500 font-medium'
                    }`}
            >
                {label} {required && <span className="text-red-400">*</span>}
            </label>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
            <div className="bg-primary p-1 h-3 w-full"></div>
            <div className="p-8 md:p-12">
                {submitted ? (
                    <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 shadow-lg shadow-green-100">
                            <CheckCircle size={40} strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">Thank You!</h3>
                        <p className="text-gray-500 text-lg max-w-sm">We have received your message and will get back to you shortly.</p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="mt-8 px-8 py-3 bg-gray-100 text-gray-900 font-bold rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Send Another
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">Get in Touch</h2>
                            <p className="text-gray-500">Have specific questions? Fill out the form below and our team will assist you.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 text-red-600 animate-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField label="First Name" name="firstName" required maxLength={50} />
                                <InputField label="Last Name" name="lastName" maxLength={50} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField label="Email Address" name="email" type="email" required maxLength={100} />
                                <InputField label="Phone Number" name="phone" type="tel" maxLength={15} />
                            </div>

                            <div className="relative group">
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('subject')}
                                    onBlur={() => setFocused('')}
                                    className="w-full bg-gray-50/50 border-b-2 border-gray-200 px-4 py-4 pt-6 rounded-t-lg focus:outline-none focus:border-primary focus:bg-white transition-all font-medium text-gray-800 appearance-none cursor-pointer"
                                >
                                    <option value="admission">Admissions Inquiry</option>
                                    <option value="fees">Fee Structure</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="careers">Careers</option>
                                </select>
                                <label className="absolute left-4 top-1 text-xs text-primary font-bold tracking-wide pointer-events-none">
                                    Subject
                                </label>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            <div className="relative group">
                                <textarea
                                    name="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('message')}
                                    onBlur={(e) => !e.target.value && setFocused('')}
                                    maxLength={1000}
                                    className={`w-full bg-gray-50/50 border-b-2 px-4 py-4 pt-8 rounded-t-lg focus:outline-none transition-all duration-300 font-medium text-gray-800 resize-none ${focused === 'message' || formData.message ? 'border-primary bg-white' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    placeholder=" "
                                ></textarea>
                                <label
                                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${focused === 'message' || formData.message
                                        ? 'top-2 text-xs text-primary font-bold tracking-wide'
                                        : 'top-6 text-gray-500 font-medium'
                                        }`}
                                >
                                    Your Message <span className="text-red-400">*</span>
                                </label>
                                <div className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${focused === 'message' ? 'w-full' : 'w-0'}`}></div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-white font-bold py-5 rounded-xl shadow-lg hover:bg-primary-dark hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Sending Message...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Message</span>
                                        <Send size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ContactForm;
