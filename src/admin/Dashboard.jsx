import React, { useState, useEffect } from 'react';
import {
    Users,
    GraduationCap,
    MoreHorizontal,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import adminFetch from './utils/adminApi';

const AdminDashboard = () => {
    // Stats state
    const [studentStats, setStudentStats] = useState({ total: 0, male: 0, female: 0 });
    const [teacherStats, setTeacherStats] = useState({ total: 0 });
    const [loading, setLoading] = useState(true);

    // Fetch stats on mount
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [studentRes, teacherRes] = await Promise.all([
                adminFetch('/students/stats/summary'),
                adminFetch('/teachers/stats/summary')
            ]);

            if (studentRes.ok) {
                const data = await studentRes.json();
                setStudentStats(data);
            }
            if (teacherRes.ok) {
                const data = await teacherRes.json();
                setTeacherStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Mock Data for Charts (can be replaced with API later)
    const attendanceData = [
        { name: 'Jan', present: 95, absent: 5 },
        { name: 'Feb', present: 88, absent: 12 },
        { name: 'Mar', present: 92, absent: 8 },
        { name: 'Apr', present: 96, absent: 4 },
        { name: 'May', present: 91, absent: 9 },
        { name: 'Jun', present: 85, absent: 15 },
        { name: 'Jul', present: 90, absent: 10 },
        { name: 'Aug', present: 94, absent: 6 },
        { name: 'Sep', present: 97, absent: 3 },
        { name: 'Oct', present: 93, absent: 7 },
        { name: 'Nov', present: 89, absent: 11 },
        { name: 'Dec', present: 95, absent: 5 },
    ];

    // Compute pie chart data from live stats
    const totalStudents = studentStats.male + studentStats.female;
    const malePercent = totalStudents > 0 ? Math.round((studentStats.male / totalStudents) * 100) : 50;
    const femalePercent = totalStudents > 0 ? 100 - malePercent : 50;

    const studentData = [
        { name: 'Male', value: malePercent, color: '#FFAB91' },
        { name: 'Female', value: femalePercent, color: '#2C3E50' },
    ];

    return (
        <div className="space-y-6">

            {/* Top Row Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="z-10">
                        <p className="text-slate-400 text-xs font-medium mb-1">Students</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {loading ? (
                                <span className="inline-block w-12 h-7 bg-slate-100 rounded animate-pulse"></span>
                            ) : studentStats.total}
                        </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-400 group-hover:text-white transition-colors">
                        <ArrowUpRight size={16} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="z-10">
                        <p className="text-slate-400 text-xs font-medium mb-1">Teachers</p>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {loading ? (
                                <span className="inline-block w-12 h-7 bg-slate-100 rounded animate-pulse"></span>
                            ) : teacherStats.total}
                        </h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-400 group-hover:text-white transition-colors">
                        <ArrowUpRight size={16} />
                    </div>
                </div>
            </div>

            {/* Middle Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Attendance Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Attendance</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E50]"></span>
                                    <span className="text-[10px] text-slate-500">Present</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFAB91]"></span>
                                    <span className="text-[10px] text-slate-500">Absent</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>2024</span>
                            <MoreHorizontal size={16} />
                        </div>
                    </div>

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="present" fill="#2C3E50" radius={[4, 4, 0, 0]} barSize={12} />
                                <Bar dataKey="absent" fill="#FFAB91" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Students Pie Chart */}
                <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center justify-between">
                    <div className="w-full flex justify-between items-start mb-2">
                        <h3 className="text-base font-bold text-slate-800">Students</h3>
                        <MoreHorizontal className="text-slate-400" size={16} />
                    </div>

                    <div className="relative w-full h-56 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={studentData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={0}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                >
                                    {studentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Icon */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-inner">
                                <Users size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-center gap-6 mt-2">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FFAB91]"></span>
                                <span className="text-xs font-medium text-slate-500">Boys</span>
                            </div>
                            <span className="text-lg font-bold text-slate-800">{studentStats.male}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E50]"></span>
                                <span className="text-xs font-medium text-slate-500">Girls</span>
                            </div>
                            <span className="text-lg font-bold text-slate-800">{studentStats.female}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
