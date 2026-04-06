'use client';

import React, { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import HealthInsightCard from '@/components/patient/HealthInsightCard';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';
import HealthTimeline from '@/components/patient/HealthTimeline';
import ActionableNextSteps from '@/components/patient/ActionableNextSteps';
import { getMetricConfig } from '@/utils/clinicalMetrics';

export default function PatientHealthInsightsPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await reportService.getPatientReports();
                // Filter reports that have either AI summary or extracted data
                const insightsReports = (Array.isArray(data) ? data : []).filter((r: any) => 
                    (r.aiSummary && r.aiSummary.length > 0) || 
                    (r.extractedData && Object.keys(r.extractedData).length > 0)
                );
                setReports(insightsReports);
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (user?.id || user?._id) {
                fetchReports();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const parseSummary = (text: string) => {
        if (!text) return { analysis: [], recommendation: "" };

        // 1. Separate Analysis from Recommendation
        const parts = text.split(/---|Recommendation:/i);
        let analysisRaw = parts[0] || "";
        let recommendationRaw = parts[1] || "";

        // 2. Clean up Analysis
        const analysisPoints = analysisRaw
            .replace(/###/g, '')
            .split(/[•\n]/)
            .map(p => p.trim())
            .filter(p => p.length > 10); // Filter out short fragments or headers

        // 3. Clean up Recommendation
        const recommendation = recommendationRaw
            .replace(/\*\*/g, '')
            .replace(/Next Step:/i, '')
            .trim();

        return { 
            analysis: analysisPoints, 
            recommendation 
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center space-x-4 mb-4">
                <Link 
                    href="/dashboard/patient" 
                    className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#4F6F6F] hover:bg-[#F6F7F5] transition-all shadow-sm group/back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/back:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">{t('healthInsights')}</h1>
                    <p className="text-[#6B7280] mt-1 text-lg font-medium tracking-tight">
                        {t('insights_subtitle')}
                    </p>
                </div>
            </div>

            {reports.length > 0 ? (
                <div className="space-y-12">
                    {reports.map((report) => {
                        const { analysis, recommendation } = parseSummary(report.aiSummary);
                        const voiceText = report.aiSummary || 
                            `${t('reportSummary')}: ${report.reportName}. ${Object.entries(report.extractedData || {}).map(([k, v]) => `${t(k.toLowerCase())} is ${v}`).join('. ')}`;

                        return (
                            <div key={report._id} className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-[#E2E8F0] space-y-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#F6F7F5] rounded-full -mr-48 -mt-48 opacity-40 group-hover:bg-[#8FB9A8]/5 transition-all duration-1000"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start space-x-5">
                                        <div className="p-4 bg-[#F6F7F5] rounded-3xl border border-[#E2E8F0] shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M10 9H8"/></svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <h2 className="text-3xl font-black text-[#1F2933] tracking-tight">{report.reportName}</h2>
                                                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">{t('latest')}</span>
                                            </div>
                                            <p className="text-[#4F6F6F] font-bold mt-1 opacity-80 flex items-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#8FB9A8] mr-2"></span>
                                                {report.testType} • {new Date(report.uploadDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                    <VoiceSummaryButton 
                                        text={voiceText} 
                                        reportId={report._id}
                                    />
                                </div>

                                {report.aiSummary && (
                                    <div className="relative z-10 space-y-8">
                                        <div className="bg-[#F8FAF9] p-8 md:p-10 rounded-[40px] border border-[#E2E8F0] shadow-inner relative">
                                            <div className="absolute top-8 right-10 flex items-center space-x-2">
                                                <div className="w-2 h-2 rounded-full bg-[#8FB9A8] animate-pulse"></div>
                                                <span className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-[0.2em]">{t('ai_analysis')}</span>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-[11px] font-black text-[#4F6F6F] uppercase tracking-[0.3em] mb-4 border-b border-[#4F6F6F]/10 pb-2 w-fit">Clinical Observation</h3>
                                                <div className="space-y-4">
                                                    {analysis.map((point, idx) => (
                                                        <div key={idx} className="flex items-start space-x-4 group/point">
                                                            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#8FB9A8] shrink-0 group-hover/point:scale-150 transition-transform"></div>
                                                            <p className="text-lg text-[#1F2933] font-medium leading-relaxed tracking-tight">
                                                                {point}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {recommendation && (
                                                    <div className="mt-10 pt-8 border-t border-[#4F6F6F]/5">
                                                        <div className="flex items-center space-x-3 mb-4">
                                                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                                                            </div>
                                                            <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.3em]">Health Recommendation</h4>
                                                        </div>
                                                        <p className="text-xl text-[#B45309] font-black italic leading-relaxed">
                                                            "{recommendation}"
                                                        </p>
                                                    </div>
                                                )}

                                                <ActionableNextSteps 
                                                    steps={[
                                                        { icon: "💧", text: "Stay hydrated with 8 glasses of water today" },
                                                        { icon: "🥗", text: "Include more leafy greens in your next meal" },
                                                        { icon: "🚶", text: "A gentle 15-minute walk will boost your energy" }
                                                    ]} 
                                                />
                                            </div>
                                        </div>

                                        <HealthTimeline 
                                            label="hemoglobin" 
                                            unit="g/dL" 
                                            status="improving"
                                            data={[
                                                { date: "2024-01-01", value: 12.1 },
                                                { date: "2024-02-01", value: 12.8 },
                                                { date: "2024-03-01", value: 13.4 }
                                            ]}
                                        />
                                    </div>
                                )}

                                {report.extractedData && Object.keys(report.extractedData).length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                        {Object.entries(report.extractedData).map(([key, value]: [string, any]) => {
                                            const config = getMetricConfig(key);
                                            
                                            return (
                                                <HealthInsightCard
                                                    key={key}
                                                    label={key.toLowerCase()}
                                                    value={value}
                                                    unit={config?.unit || ""}
                                                    ranges={config ? { min: config.min, max: config.max } : undefined}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white p-24 rounded-[50px] border-2 border-dashed border-[#E2E8F0] text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-[#F6F7F5] rounded-full flex items-center justify-center text-[#94A3B8]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div className="max-w-md">
                        <p className="text-xl font-black text-[#1F2933]">{t('no_insights_found')}</p>
                        <p className="text-[#6B7280] font-medium mt-2">Reports processed by our AI will automatically populate this section with indicators and analysis.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
