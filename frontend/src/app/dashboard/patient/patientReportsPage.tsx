'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { reportService } from '@/services/reportService';
import PatientReportCard from '@/components/patient/PatientReportCard';
import { Report } from '@/types';

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    Normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    Healthy: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    High: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
    Low: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    Abnormal: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
};

const getStatus = (s?: string) =>
    STATUS_COLORS[s ?? ''] ?? { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };

const testTypeIcons: Record<string, string> = {
    'Blood Test': '🩸',
    'Hormone Test': '⚗️',
    'Urine Test': '🧪',
    'Imaging': '🗜️',
};

const TEST_TYPES = ['All', 'Blood Test', 'Hormone Test', 'Urine Test', 'Imaging', 'Other'];

export default function PatientReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await reportService.getPatientReports();
                setReports(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch reports', err);
                setReports([]);
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading && (user?.id || user?._id)) {
            fetchReports();
        }
    }, [user, authLoading]);

    const filtered = reports.filter(r => {
        const matchSearch = (r.reportName ?? '').toLowerCase().includes(search.toLowerCase()) ||
            (r.testType ?? '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || r.testType === filter;
        return matchSearch && matchFilter;
    });

    const totalReports = reports.length;
    const abnormalCount = reports.filter(r => {
        const s = (r as any).status?.toLowerCase();
        return s === 'high' || s === 'low' || s === 'abnormal';
    }).length;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/patient"
                        className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#4F6F6F] hover:bg-[#F6F7F5] transition-all shadow-sm group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Medical Reports</h1>
                        <p className="text-[#6B7280] text-base font-medium mt-0.5">Your complete diagnostic history and digital health records.</p>
                    </div>
                </div>

                {/* Summary badges */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-center bg-white border border-[#E2E8F0] rounded-2xl px-5 py-3 shadow-sm">
                        <span className="text-2xl font-black text-[#1F2933]">{totalReports}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Total</span>
                    </div>
                    {abnormalCount > 0 && (
                        <div className="flex flex-col items-center bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3">
                            <span className="text-2xl font-black text-rose-600">{abnormalCount}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Needs Review</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Search + Filter toolbar ── */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#E2E8F0] flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                        type="text"
                        placeholder="Search by report name or test type..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#F6F7F5] rounded-2xl border-transparent focus:bg-white focus:border-[#8FB9A8] border outline-none transition-all font-medium text-sm text-[#1F2933]"
                    />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {TEST_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
                                filter === type
                                    ? 'bg-[#4F6F6F] text-white shadow-md'
                                    : 'bg-[#F6F7F5] text-[#6B7280] hover:bg-[#E2E8F0]'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Report List ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"/>
                    <p className="text-[#6B7280] font-medium">Loading your reports…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-dashed border-[#E2E8F0] py-24 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-[#F6F7F5] rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8FB9A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-black text-[#1F2933]">
                            {search || filter !== 'All' ? 'No matching reports' : 'No reports yet'}
                        </h3>
                        <p className="text-[#6B7280] font-medium mt-1 text-sm">
                            {search || filter !== 'All'
                                ? 'Try adjusting your search or filter.'
                                : 'Reports uploaded by your pathology lab will appear here.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {filtered.map(report => (
                        <PatientReportCard key={report._id} report={report} />
                    ))}
                </div>
            )}
        </div>
    );
}
