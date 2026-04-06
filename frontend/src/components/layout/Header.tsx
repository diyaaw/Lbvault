'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import LanguageSelector from '@/components/patient/LanguageSelector';
import NotificationBell from './NotificationBell';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="h-20 bg-white border-b border-[#E2E8F0] px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
            <div>
                <h1 className="text-xl font-bold text-[#1F2933] capitalize">{user?.role} Portal</h1>
                <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-6">
                <NotificationBell />
                <div className="flex items-center space-x-3 border-l border-[#E2E8F0] pl-6">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-[#1F2933]">{user?.name}</p>
                        <p className="text-[10px] font-bold text-[#4F6F6F] uppercase tracking-wider">{user?.role}</p>
                    </div>
                    <div className="w-10 h-10 bg-[#8FB9A8] rounded-full flex items-center justify-center text-[#1F2933] font-bold border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
                        {user?.name?.charAt(0)}
                    </div>
                </div>
            </div>
        </header>
    );
}
