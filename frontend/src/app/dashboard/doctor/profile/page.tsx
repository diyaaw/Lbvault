'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';

export default function DoctorProfilePage() {
    const { user } = useAuth();

    const profileData = {
        name: user?.name || "Doctor",
        email: user?.email || "N/A",
        specialty: "General Pathology",
        degree: "MBBS, MD (Pathology)",
        experience: "12+ Years",
        hospital: "City Life Medical Center",
        phone: "+91 98888 77777",
        address: "Suite 405, Medical Square, Mumbai"
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div className="flex items-center space-x-4 mb-8">
                <Link 
                    href="/dashboard/doctor" 
                    className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#4F6F6F] hover:bg-[#F6F7F5] transition-all shadow-sm group/back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/back:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-[#1F2933]">Doctor Profile</h1>
                    <p className="text-[#6B7280] mt-1 text-lg font-medium">Manage your professional credentials and clinical settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Basic Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0] text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#4F6F6F]"></div>
                        <div className="w-32 h-32 bg-[#F6F7F5] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md relative group">
                            <span className="text-4xl font-black text-[#4F6F6F]">Dr</span>
                        </div>
                        <h2 className="text-2xl font-black text-[#1F2933]">{profileData.name}</h2>
                        <p className="text-[#4F6F6F] font-bold uppercase tracking-widest text-xs mt-1">{profileData.degree}</p>

                        <div className="mt-8 pt-8 border-t border-[#F6F7F5]">
                            <div className="bg-[#4F6F6F]/5 p-4 rounded-3xl">
                                <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-wider mb-1">Specialty</p>
                                <p className="text-md font-black text-[#1F2933]">{profileData.specialty}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0]">
                        <h3 className="text-xl font-black text-[#1F2933] mb-8">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Practice Name</p>
                                <p className="font-bold text-[#1F2933]">{profileData.hospital}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Email Address</p>
                                <p className="font-bold text-[#1F2933]">{profileData.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Contact Number</p>
                                <p className="font-bold text-[#1F2933]">{profileData.phone}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Experience</p>
                                <p className="font-bold text-[#4F6F6F]">{profileData.experience}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Clinic Address</p>
                                <p className="font-bold text-[#1F2933]">{profileData.address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
