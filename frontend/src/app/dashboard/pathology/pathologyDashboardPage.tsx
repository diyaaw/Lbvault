'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/dashboard/analytics`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAnalytics(res.data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const stats = [
        {
            name: 'Reports Today',
            value: analytics?.uploadedToday || '0',
            change: analytics?.reportTrend || '+0%',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            )
        },
        {
            name: 'Total Patients',
            value: analytics?.totalPatients || '0',
            change: analytics?.patientTrend || '+0%',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            )
        },
        {
            name: 'Total Reports',
            value: analytics?.totalReports || '0',
            change: 'Overall',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
            )
        },
        {
            name: 'System Status',
            value: analytics?.systemStatus || 'Active',
            change: analytics?.uptime || '100%',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            )
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-black text-[#1F2933]">Pathology Overview</h1>
                <p className="text-[#6B7280] mt-1 text-lg font-medium">Monitoring LabVault digital records and upload activity.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-[#F6F7F5] text-[#4F6F6F] rounded-2xl border border-[#E2E8F0]">
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F6F7F5] text-[#4F6F6F]'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-[#6B7280] text-sm font-bold uppercase tracking-wider">{stat.name}</h3>
                        <p className="text-3xl font-black text-[#1F2933] mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Reports Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                    <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
                        <h2 className="text-xl font-black text-[#1F2933]">Recent Report Uploads</h2>
                        <Link href="/dashboard/pathology/reports" className="text-sm font-bold text-[#4F6F6F] hover:underline">View All Reports</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#F6F7F5]">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Patient Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Test Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Upload Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                                {analytics?.recentUploads?.map((report: any) => (
                                    <tr key={report.reportId} className="hover:bg-[#F6F7F5] transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-[#1F2933]">{report.patientName}</td>
                                        <td className="px-6 py-4 text-sm text-[#4F6F6F] font-bold">{report.testType}</td>
                                        <td className="px-6 py-4 text-sm text-[#6B7280] font-medium">{new Date(report.uploadDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={report.patientName ? `${report.patientName}_report.pdf` : 'report.pdf'}
                                                className="text-[#4F6F6F] hover:text-[#8FB9A8] font-bold underline"
                                            >
                                                View PDF
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                {(!analytics?.recentUploads || analytics.recentUploads.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-[#6B7280] font-medium">
                                            No recent uploads found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Sidebar Widget: Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-[#4F6F6F] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-xl font-black mb-4 relative z-10">Upload Lab Report</h3>
                        <p className="text-[#8FB9A8] text-sm mb-6 relative z-10 leading-relaxed font-bold">Add new patient lab results to the digital vault securely.</p>
                        <Link href="/dashboard/pathology/upload-report" className="inline-flex items-center justify-center w-full bg-[#8FB9A8] text-[#1F2933] font-black py-4 rounded-2xl hover:bg-white transition-all shadow-lg active:scale-95 group relative z-10">
                            Create New Report
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0]">
                        <h3 className="text-lg font-black text-[#1F2933] mb-4">Laboratory Shortcuts</h3>
                        <div className="space-y-3">
                            <Link href="/dashboard/pathology/patients" className="flex items-center p-4 rounded-2xl hover:bg-[#F6F7F5] transition-colors border border-transparent hover:border-[#E2E8F0] group">
                                <div className="w-10 h-10 rounded-xl bg-[#F6F7F5] text-[#4F6F6F] flex items-center justify-center mr-4 group-hover:bg-[#8FB9A8] group-hover:text-[#1F2933] transition-colors shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                </div>
                                <span className="text-sm font-bold text-[#1F2933]">Patient Directory</span>
                            </Link>
                            <Link href="/dashboard/pathology/doctors" className="flex items-center p-4 rounded-2xl hover:bg-[#F6F7F5] transition-colors border border-transparent hover:border-[#E2E8F0] group">
                                <div className="w-10 h-10 rounded-xl bg-[#F6F7F5] text-[#4F6F6F] flex items-center justify-center mr-4 group-hover:bg-[#8FB9A8] group-hover:text-[#1F2933] transition-colors shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8h2b-2 3h2b-2 3h2" /><path d="M22 10v6" /><path d="M14 2h-1a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h1" /></svg>
                                </div>
                                <span className="text-sm font-bold text-[#1F2933]">Doctor Directory</span>
                            </Link>
                            <Link href="/dashboard/pathology/reports" className="flex items-center p-4 rounded-2xl hover:bg-[#F6F7F5] transition-colors border border-transparent hover:border-[#E2E8F0] group">
                                <div className="w-10 h-10 rounded-xl bg-[#F6F7F5] text-[#4F6F6F] flex items-center justify-center mr-4 group-hover:bg-[#8FB9A8] group-hover:text-[#1F2933] transition-colors shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                </div>
                                <span className="text-sm font-bold text-[#1F2933]">All Reports</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
