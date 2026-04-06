'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reportService } from '@/services/reportService';
import { Report } from '@/types';

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const data = await reportService.getAllReports();
                setReports(data);
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const patientName = typeof report.patientId === 'object' ? report.patientId?.name : 'Unknown';
        const matchesSearch =
            report.reportName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patientName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || report.testType === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const exportReports = () => {
        const headers = ["Report Name", "Patient", "Test Type", "Date"];
        const rows = filteredReports.map(r => [
            `"${r.reportName}"`,
            `"${typeof r.patientId === 'object' ? r.patientId?.name : 'Unknown'}"`,
            `"${r.testType}"`,
            `"${new Date(r.uploadDate).toLocaleDateString()}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `labvault_reports_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1F2933]">Digital Report Archive</h1>
                    <p className="text-[#6B7280] mt-1 text-lg font-medium">Search and manage the entire digital pathology database.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={exportReports}
                        className="bg-white text-[#4F6F6F] font-black border border-[#E2E8F0] px-6 py-3 rounded-2xl hover:bg-[#F6F7F5] transition-all shadow-sm flex items-center"
                    >
                        <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        Export CSV
                    </button>
                    <Link href="/dashboard/pathology/upload-report" className="bg-[#4F6F6F] text-white font-black px-8 py-3 rounded-2xl hover:bg-[#3D5A5A] transition-all shadow-lg shadow-[#4F6F6F]/20">
                        Upload New
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-[#E2E8F0] overflow-hidden">
                <div className="p-6 border-b border-[#E2E8F0] bg-[#F6F7F5]/50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by patient or report name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#4F6F6F]/10 outline-none transition-all font-medium"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F6F]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white px-6 py-3 rounded-2xl border border-[#E2E8F0] outline-none font-bold text-[#1F2933] min-w-[200px]"
                        >
                            <option value="All">All Categories</option>
                            <option value="Complete Blood Count (CBC)">CBC</option>
                            <option value="Lipid Profile">Lipid Profile</option>
                            <option value="Thyroid Function Test">Thyroid</option>
                            <option value="Blood Glucose">Glucose</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F6F7F5] text-left">
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Report Name</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Patient</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Type</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Upload Date</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center">
                                        <div className="w-10 h-10 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredReports.map((report) => (
                                <tr key={report._id} className="hover:bg-[#F6F7F5] transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-[#1F2933]">{report.reportName}</td>
                                    <td className="px-8 py-5 text-sm font-bold text-[#4F6F6F]">{typeof report.patientId === 'object' ? report.patientId?.name : 'Unknown'}</td>
                                    <td className="px-8 py-5 text-sm">
                                        <span className="bg-[#8FB9A8]/10 text-[#4F6F6F] px-3 py-1 rounded-full text-xs font-black border border-[#8FB9A8]/30">
                                            {report.testType}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-[#6B7280] font-medium">{new Date(report.uploadDate).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                            target="_blank"
                                            className="bg-[#F6F7F5] text-[#1F2933] font-black px-5 py-2 rounded-xl text-xs hover:bg-[#4F6F6F] hover:text-white border border-[#E2E8F0] shadow-sm transition-all inline-block"
                                        >
                                            View Report
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-16 text-center text-[#6B7280] font-medium">
                                        No reports found in the digital vault.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
