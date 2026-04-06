'use client';

import React, { useState, useRef } from 'react';
import { reportService } from '@/services/reportService';

interface VoiceReportProps {
    reportId: string;
}

const LANGUAGES = [
    { label: '🇬🇧 English', value: 'English' },
    { label: '🇮🇳 Hindi', value: 'Hindi' },
    { label: '🇮🇳 Marathi', value: 'Marathi' },
    { label: '🇮🇳 Telugu', value: 'Telugu' },
];

export default function VoiceReport({ reportId }: VoiceReportProps) {
    const [language, setLanguage] = useState('English');
    const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const urlRef = useRef<string | null>(null);

    const cleanup = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
        }
    };

    const handlePlay = async () => {
        cleanup();
        setErrorMsg('');
        setStatus('loading');
        try {
            const blob = await reportService.getVoiceAudio(reportId, language);
            const url = URL.createObjectURL(blob);
            urlRef.current = url;
            const audio = new Audio(url);
            audioRef.current = audio;
            setStatus('playing');
            audio.play();
            audio.onended = () => { setStatus('idle'); cleanup(); };
            audio.onerror = () => { setStatus('idle'); cleanup(); };
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Voice generation failed';
            // Show the actual message from the backend (Gemini/Google)
            setErrorMsg(msg);
            setStatus('error');
        }
    };

    const handleStop = () => {
        cleanup();
        setStatus('idle');
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                {/* Language selector */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F6F7F5] rounded-xl border border-[#E2E8F0]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                    <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        disabled={status === 'loading' || status === 'playing'}
                        className="bg-transparent text-xs font-bold text-[#4F6F6F] outline-none cursor-pointer disabled:opacity-50"
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>

                {/* Play / Stop button */}
                {status === 'playing' ? (
                    <button
                        onClick={handleStop}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                        Stop
                    </button>
                ) : (
                    <button
                        onClick={handlePlay}
                        disabled={status === 'loading'}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#4F6F6F] text-white text-xs font-black uppercase tracking-widest hover:bg-[#1F2933] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                Generating…
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Play in {language}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Inline error message — no more browser alert! */}
            {status === 'error' && errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
                    <svg className="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    );
}
