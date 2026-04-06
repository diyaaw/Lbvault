'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { patientService } from '@/services/patientService';

export default function PatientsPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchPatients = async (searchQuery: string) => {
        setLoading(true);
        try {
            const data = await patientService.searchPatients(searchQuery);
            setPatients(data);
        } catch (err) {
            console.error('Failed to fetch patients', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPatients(query);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1F2933]">Patient Directory</h1>
                    <p className="text-[#6B7280] mt-1 text-lg font-medium">
                        Search registered patients and upload their lab reports.
                    </p>
                </div>
                <Link
                    href="/dashboard/pathology/upload-report"
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    Upload Report
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-[#E2E8F0] overflow-hidden">
                <div className="p-6 border-b border-[#E2E8F0] bg-[#F6F7F5]/50">
                    <div className="relative w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Search patients by name, email, or patient ID..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#4F6F6F]/10 focus:border-[#4F6F6F] outline-none transition-all font-medium"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F6F]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F6F7F5] text-left">
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Patient</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Contact</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Demographics</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
                                    </td>
                                </tr>
                            ) : patients.map((patient) => (
                                <tr key={patient._id} className="hover:bg-[#F6F7F5] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-[#1F2933]">{patient.name}</div>
                                        <div className="text-[10px] text-[#8FB9A8] font-black uppercase tracking-wider mt-0.5">
                                            {patient.patientCustomId || `ID: ${patient._id.slice(-6)}`}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm text-[#4F6F6F] font-bold">{patient.email}</div>
                                        <div className="text-[10px] text-[#6B7280] font-medium">{patient.phone || '—'}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex gap-2 flex-wrap">
                                            <span className="bg-[#F6F7F5] text-[#4F6F6F] px-2 py-0.5 rounded-lg text-[10px] font-black border border-[#E2E8F0]">
                                                {patient.age || '?'} Yrs
                                            </span>
                                            <span className="bg-[#F6F7F5] text-[#4F6F6F] px-2 py-0.5 rounded-lg text-[10px] font-black border border-[#E2E8F0]">
                                                {patient.gender || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Link
                                            href={`/dashboard/pathology/upload-report?patientId=${patient._id}&name=${encodeURIComponent(patient.name)}`}
                                            className="bg-[#4F6F6F] text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-[#1F2933] transition-all active:scale-95 shadow-sm inline-flex items-center gap-1.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                            Upload Report
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!loading && patients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center">
                                        <div className="w-16 h-16 bg-[#F6F7F5] rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                        </div>
                                        <p className="text-[#1F2933] font-bold">
                                            {query ? 'No patients match your search.' : 'No patients yet.'}
                                        </p>
                                        <p className="text-[#9CA3AF] text-sm mt-1">
                                            Patients self-register via the public signup page.
                                        </p>
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
