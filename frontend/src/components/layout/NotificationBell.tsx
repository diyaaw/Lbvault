'use client';

import React, { useState } from 'react';

const mockNotifications = [
    { id: 1, text: 'New blood test report uploaded', time: '5m ago', type: 'new_report' },
    { id: 2, text: 'Doctor Sharma added a comment on your MRI scan', time: '1h ago', type: 'doctor_comment' },
    { id: 3, text: 'Reports shared successfully with Dr. Smith', time: '2h ago', type: 'share_success' },
];

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#6B7280] hover:text-[#4F6F6F] transition-colors relative p-2 rounded-full hover:bg-[#F6F7F5]"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-[#E2E8F0] bg-[#F6F7F5]/50">
                            <h3 className="font-black text-[#1F2933] text-sm">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {mockNotifications.map((notif) => (
                                <div key={notif.id} className="p-4 border-b border-[#E2E8F0] hover:bg-[#F6F7F5] transition-colors cursor-pointer group">
                                    <p className="text-sm font-bold text-[#1F2933] group-hover:text-[#4F6F6F]">{notif.text}</p>
                                    <p className="text-[10px] text-[#6B7280] mt-1 font-bold uppercase tracking-wider">{notif.time}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 text-center border-t border-[#E2E8F0]">
                            <button className="text-xs font-bold text-[#4F6F6F] hover:underline">View All Notifications</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
