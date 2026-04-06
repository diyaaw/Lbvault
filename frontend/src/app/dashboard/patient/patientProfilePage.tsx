'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

export default function PatientProfilePage() {
    const { t } = useLanguage();
    const { user } = useAuth();

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const initials = user?.name ? getInitials(user.name) : "PT";

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-4 mb-4">
                        <Link 
                            href="/dashboard/patient" 
                            className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#4F6F6F] hover:bg-[#F6F7F5] transition-all shadow-sm group/back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/back:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black text-[#1F2933] tracking-tight">Profile Settings</h1>
                            <p className="text-[#6B7280] font-medium tracking-tight mt-1">LV-{user?.id?.substring(0, 8) || 'MEMBER'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Basic Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0] text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#8FB9A8]"></div>
                        <div className="w-32 h-32 bg-[#F6F7F5] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md relative group">
                            <span className="text-4xl font-black text-[#4F6F6F] group-hover:scale-110 transition-transform">{initials}</span>
                            <button className="absolute bottom-0 right-0 bg-[#4F6F6F] text-white p-2 rounded-full border-4 border-white hover:bg-[#1F2933] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            </button>
                        </div>
                        <h2 className="text-2xl font-black text-[#1F2933]">{user?.name}</h2>
                        <p className="text-[#4F6F6F] font-bold uppercase tracking-widest text-xs mt-1">Patient ID: LV-{user?.id?.substring(0, 5) || '90210'}</p>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-[#F6F7F5] p-4 rounded-3xl border border-[#E2E8F0]">
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider mb-1">Age</p>
                                <p className="text-xl font-black text-[#1F2933]">{user?.age || 'N/A'}</p>
                            </div>
                            <div className="bg-[#F6F7F5] p-4 rounded-3xl border border-[#E2E8F0]">
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider mb-1">Blood</p>
                                <p className="text-xl font-black text-rose-600">{user?.bloodGroup || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-[#1F2933]">Personal Information</h3>
                            <button className="text-[#4F6F6F] font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Full Name</p>
                                <p className="font-bold text-[#1F2933]">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Email Address</p>
                                <p className="font-bold text-[#1F2933]">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Mobile Number</p>
                                <p className="font-bold text-[#1F2933]">{user?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Preferred Language</p>
                                <p className="font-bold text-[#4F6F6F]">English</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Home Address</p>
                                <p className="font-bold text-[#1F2933]">{user?.address || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">Gender</p>
                                <p className="font-black text-amber-900">{user?.gender || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
