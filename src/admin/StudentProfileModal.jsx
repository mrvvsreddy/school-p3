import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import adminFetch from './utils/adminApi';

const StudentProfileModal = ({ student, onClose, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    // Prevent scrolling on body when modal is open
    useEffect(() => {
        if (student) {
            document.body.style.overflow = 'hidden';
            // Map API fields to form data
            setFormData({
                name: student.name || '',
                dob: student.dob || '',
                gender: student.gender || '',
                blood_group: student.blood_group || '',
                religion: student.religion || '',
                admission_id: student.admission_id || '',
                section: student.section || '',
                father_name: student.father_name || '',
                father_occupation: student.father_occupation || '',
                mother_name: student.mother_name || '',
                mother_occupation: student.mother_occupation || '',
                phone: student.phone || '',
                email: student.email || '',
                address: student.address || ''
            });
            setIsEditing(false);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [student]);

    if (!student) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await adminFetch(`/students/${student.id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsEditing(false);
                if (onUpdate) onUpdate();
            } else {
                const err = await response.json();
                alert(err.detail || 'Failed to update student');
            }
        } catch (err) {
            alert('Error updating student');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(student.id);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: student.name || '',
            dob: student.dob || '',
            gender: student.gender || '',
            blood_group: student.blood_group || '',
            religion: student.religion || '',
            admission_id: student.admission_id || '',
            section: student.section || '',
            father_name: student.father_name || '',
            father_occupation: student.father_occupation || '',
            mother_name: student.mother_name || '',
            mother_occupation: student.mother_occupation || '',
            phone: student.phone || '',
            email: student.email || '',
            address: student.address || ''
        });
        setIsEditing(false);
    };

    const InputField = ({ label, name, type = "text", value, options }) => {
        if (!isEditing) {
            return (
                <div>
                    <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                    <p className="text-sm font-bold text-slate-700">{value || 'N/A'}</p>
                </div>
            );
        }

        return (
            <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">{label}</label>
                {options ? (
                    <select
                        name={name}
                        value={value}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold text-slate-700"
                    >
                        <option value="">Select {label}</option>
                        {options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-bold text-slate-700"
                    />
                )}
            </div>
        );
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm overflow-y-auto py-10">
            <div className="bg-white rounded-3xl p-8 w-full max-w-5xl shadow-2xl transform transition-all my-auto relative m-4 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col sm:flex-row gap-8">
                    {/* Left Column - Compact */}
                    <div className="sm:w-48 flex flex-col items-center text-center shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-orange-50 shadow-lg mb-3 bg-blue-100 flex items-center justify-center">
                            {student.profile_image ? (
                                <img src={student.profile_image} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-blue-600">
                                    {student.name?.charAt(0) || 'S'}
                                </span>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-slate-800 mb-1">{student.name}</h2>
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-3">
                            {student.student_id}
                        </span>

                        <div className="w-full bg-slate-50 rounded-xl px-3 py-2 text-left">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Class</p>
                            <p className="text-sm font-bold text-slate-800">{student.class_name || 'Not Assigned'}</p>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex-1 space-y-10 py-2">
                        {/* Personal Info Section */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 font-serif">Personal Information</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-8">
                                <InputField label="Date of Birth" name="dob" type="date" value={formData.dob} />
                                <InputField label="Gender" name="gender" value={formData.gender} options={['Male', 'Female', 'Other']} />
                                <InputField label="Blood Group" name="blood_group" value={formData.blood_group} options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
                                <InputField label="Religion" name="religion" value={formData.religion} />
                                <InputField label="Admission ID" name="admission_id" value={formData.admission_id} />
                                <InputField label="Section" name="section" value={formData.section} options={['A', 'B', 'C', 'D']} />
                            </div>
                        </div>

                        {/* Parent Info Section */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 font-serif">Parent & Contact</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                <InputField label="Father's Name" name="father_name" value={formData.father_name} />
                                <InputField label="Father's Occupation" name="father_occupation" value={formData.father_occupation} />
                                <InputField label="Mother's Name" name="mother_name" value={formData.mother_name} />
                                <InputField label="Mother's Occupation" name="mother_occupation" value={formData.mother_occupation} />
                                <InputField label="Phone Number" name="phone" value={formData.phone} />
                                <div className="break-all">
                                    <InputField label="Email Address" name="email" value={formData.email} />
                                </div>
                                <div className="sm:col-span-2">
                                    <InputField label="Residential Address" name="address" value={formData.address} />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex gap-4">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-6 py-2.5 rounded-lg border border-red-100 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        Remove Student
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-lg bg-[#2C3E50] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1a252f] transition-colors cursor-pointer shadow-lg disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving && <Loader2 size={14} className="animate-spin" />}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StudentProfileModal;
