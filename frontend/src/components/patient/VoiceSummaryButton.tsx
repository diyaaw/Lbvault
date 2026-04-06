'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { reportService } from '@/services/reportService';

interface VoiceSummaryButtonProps {
    text: string;
    lang?: string;
    reportId?: string;
    disabled?: boolean;
}

export default function VoiceSummaryButton({ text, lang, reportId, disabled }: VoiceSummaryButtonProps) {
    const { language, t } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
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

    const speak = async () => {
        if (!reportId) return;

        cleanup();
        setStatus('loading');

        try {
            const targetLang = lang || language;
            console.log(`[DEBUG] Requesting High-Quality Voice (Rachel) in: ${targetLang}`);
            
            const blob = await reportService.getVoiceAudio(reportId, targetLang);
            const url = URL.createObjectURL(blob);
            urlRef.current = url;
            
            const audio = new Audio(url);
            audioRef.current = audio;
            
            setStatus('playing');
            audio.play();
            
            audio.onended = () => {
                setStatus('idle');
                cleanup();
            };
            
            audio.onerror = () => {
                setStatus('idle');
                cleanup();
            };
        } catch (err) {
            console.error('[VOICE ERROR] Failed to generate AI speech (Rachel):', err);
            setStatus('error');
        }
    };

    const stop = () => {
        cleanup();
        setStatus('idle');
    };

    return (
        <button 
            onClick={status === 'playing' ? stop : speak}
            disabled={disabled || status === 'loading'}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border outline-none active:scale-95 ${
                disabled || status === 'loading'
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                : status === 'playing'
                ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-lg'
                : 'bg-[#F6F7F5] text-[#4F6F6F] border-[#E2E8F0] hover:bg-white hover:shadow-md hover:border-[#8FB9A8]'
            }`}
        >
            {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-[#4F6F6F]/30 border-t-[#4F6F6F] rounded-full animate-spin"></div>
            ) : status === 'playing' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            )}
            <span>
                {status === 'loading' ? t('analyzing') || 'Opening...' : status === 'playing' ? 'Stop' : t('listen')}
            </span>
        </button>
    );
}
