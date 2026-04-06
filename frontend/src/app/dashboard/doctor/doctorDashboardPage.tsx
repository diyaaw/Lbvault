'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { patientService } from '@/services/patientService';
import { Patient } from '@/types';
import api from '@/services/api';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sharedCount, setSharedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pts, reports] = await Promise.allSettled([
          patientService.getDoctorPatients(),
          api.get('/doctor/shared-reports'),
        ]);
        if (pts.status === 'fulfilled') setPatients(pts.value || []);
        if (reports.status === 'fulfilled') {
          const data = reports.value.data || [];
          setSharedCount(data.length);
          setRecentReports(data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const StatCard = ({ icon, label, value, accent = false }: any) => (
    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col gap-3 ${accent ? 'bg-[#4F6F6F] border-[#4F6F6F] text-white' : 'bg-white border-[#E2E8F0]'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent ? 'bg-white/20' : 'bg-[#F6F7F5]'}`}>
        {icon}
      </div>
      <p className={`text-[10px] font-black uppercase tracking-widest ${accent ? 'text-[#8FB9A8]' : 'text-[#6B7280]'}`}>{label}</p>
      <p className={`text-3xl font-black ${accent ? 'text-white' : 'text-[#1F2933]'}`}>{loading ? '—' : value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Doctor Portal</h1>
          <p className="text-[#6B7280] mt-1 text-lg font-medium">
            Welcome, <span className="text-[#4F6F6F] font-black">Dr. {user?.name}</span>. Review patient reports and clinical data.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Verified Doctor</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="Assigned Patients"
          value={patients.length}
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>}
          label="Shared Reports"
          value={sharedCount}
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          label="Pending Reviews"
          value={recentReports.filter((r: any) => !r.doctorComment).length}
        />
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          label="Notes Written"
          value={recentReports.filter((r: any) => r.doctorComment).length}
          accent
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Shared Reports */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1F2933]">Recent Shared Reports</h2>
            <Link href="/dashboard/doctor/shared-reports" className="text-sm font-bold text-[#4F6F6F] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-[#F6F7F5]">
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
              </div>
            ) : recentReports.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-[#6B7280] font-bold">No shared reports yet.</p>
                <p className="text-sm text-[#94A3B8] mt-1">Patients will share reports with you from their dashboard.</p>
              </div>
            ) : recentReports.map((report: any) => (
              <div key={report._id} className="p-6 flex items-center gap-4 hover:bg-[#F6F7F5] transition-colors group">
                <div className="w-12 h-12 bg-[#F6F7F5] rounded-2xl flex items-center justify-center group-hover:bg-[#8FB9A8]/20 transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[#1F2933] truncate">{report.reportName}</p>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    {typeof report.patientId === 'object' ? report.patientId?.name : 'Patient'} · {report.testType}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {report.doctorComment ? (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">Reviewed</span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider">Pending</span>
                  )}
                  <Link
                    href={`/dashboard/doctor/shared-reports`}
                    className="p-2 text-[#4F6F6F] bg-[#F6F7F5] rounded-xl hover:bg-[#E2E8F0] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Recent Patients */}
        <div className="space-y-6">
          {/* Quick Nav */}
          <div className="bg-[#4F6F6F] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
            <h3 className="text-lg font-black mb-4 relative z-10">Quick Access</h3>
            <div className="space-y-3 relative z-10">
              <Link href="/dashboard/doctor/patients" className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span className="text-sm font-black">My Patients</span>
              </Link>
              <Link href="/dashboard/doctor/shared-reports" className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span className="text-sm font-black">Shared Reports</span>
              </Link>
              <Link href="/dashboard/doctor/profile" className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span className="text-sm font-black">My Profile</span>
              </Link>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0]">
            <h3 className="text-lg font-black text-[#1F2933] mb-4">Recent Patients</h3>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-[#6B7280] font-medium">Loading…</p>
              ) : patients.slice(0, 4).map((p) => (
                <div key={p._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#8FB9A8]/20 rounded-full flex items-center justify-center text-[#4F6F6F] font-black text-sm shrink-0">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#1F2933] truncate">{p.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{p.email}</p>
                  </div>
                </div>
              ))}
              {!loading && patients.length === 0 && (
                <p className="text-sm text-[#6B7280] font-medium">No patients assigned yet.</p>
              )}
              {patients.length > 4 && (
                <Link href="/dashboard/doctor/patients" className="text-xs font-black text-[#4F6F6F] hover:underline block text-center pt-2">
                  +{patients.length - 4} more patients
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
