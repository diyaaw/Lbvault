'use client';

import React, { useState, useEffect } from 'react';
import { patientService } from '@/services/patientService';

export default function AccessManagement() {
    const [accessList, setAccessList] = useState<any[]>([]);
    const [doctorId, setDoctorId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchAccessList();
    }, []);

    const fetchAccessList = async () => {
        try {
            const data = await patientService.getAccessList();
            setAccessList(data);
        } catch (err) {
            console.error('Failed to fetch access list', err);
        }
    };

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doctorId) return;

        try {
            setLoading(true);
            await patientService.grantAccess(doctorId);
            setMessage({ type: 'success', text: 'Access granted successfully!' });
            setDoctorId('');
            fetchAccessList();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to grant access. Please check the Doctor ID.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleRevoke = async (docId: string, reportId: string | null = null) => {
        try {
            setLoading(true);
            await patientService.revokeAccess(docId, reportId);
            setMessage({ type: 'success', text: 'Access revoked successfully!' });
            fetchAccessList();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to revoke access.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0] space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#1F2933]">Manage Doctor Access</h2>
                <div className="bg-[#8FB9A8]/10 px-4 py-1 rounded-full border border-[#8FB9A8]/20">
                    <span className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest">Secure Ownership</span>
                </div>
            </div>

            {/* Grant Access Form */}
            <form onSubmit={handleGrant} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <input 
                        type="text" 
                        placeholder="Enter Doctor ID (e.g., LV-DOC-123)"
                        className="w-full px-6 py-3 rounded-2xl border border-[#E2E8F0] bg-[#F6F7F5] outline-none font-bold text-[#1F2933] focus:border-[#8FB9A8] transition-all"
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <button 
                    type="submit"
                    className="px-8 py-3 bg-[#4F6F6F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1F2933] transition-all active:scale-95 disabled:opacity-50"
                    disabled={loading || !doctorId}
                >
                    {loading ? 'Processing...' : 'Grant Access'}
                </button>
            </form>

            {message && (
                <div className={`p-4 rounded-2xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {message.text}
                </div>
            )}

            {/* List of Authorsized Doctors */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-[#6B7280] uppercase tracking-widest">Authorized Healthcare Providers</h3>
                
                {accessList.length === 0 ? (
                    <div className="bg-[#F6F7F5] p-10 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
                        <p className="text-[#6B7280] font-bold text-sm">No doctors currently have access.</p>
                        <p className="text-[10px] text-[#94A3B8] mt-1 italic tracking-tight">You are the sole owner of your medical records.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {accessList.map((access) => (
                            <div key={access._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#F6F7F5] rounded-3xl border border-[#E2E8F0] group hover:border-[#8FB9A8] transition-all">
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[#4F6F6F] border border-[#E2E8F0] group-hover:bg-[#8FB9A8] group-hover:text-white transition-all shadow-sm">
                                        {access.doctorId.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-[#1F2933]">Dr. {access.doctorId.name}</p>
                                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                                            {access.reportId ? `Report: ${access.reportId.reportName}` : 'Global Access (All Reports)'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRevoke(access.doctorId._id, access.reportId?._id)}
                                    className="px-6 py-2 bg-white border border-[#E2E8F0] text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                                    disabled={loading}
                                >
                                    Revoke Access
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
