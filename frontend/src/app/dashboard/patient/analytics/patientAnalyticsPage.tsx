'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/lib/AuthContext';
import AnalyticsChart from '@/components/patient/AnalyticsChart';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TIME_FILTERS = ['All Time', '3 Months', '6 Months', '1 Year'];

const BIOMARKER_NORMS: Record<string, { min: number; max: number; unit: string; color: string }> = {
  Glucose: { min: 70, max: 100, unit: 'mg/dL', color: '#6366F1' },
  Hemoglobin: { min: 13.5, max: 17.5, unit: 'g/dL', color: '#4F6F6F' },
  WBC: { min: 4000, max: 11000, unit: 'cells/mcL', color: '#8B5CF6' },
  RBC: { min: 4.5, max: 5.9, unit: 'M/uL', color: '#10B981' },
  Platelets: { min: 150000, max: 450000, unit: '/uL', color: '#F59E0B' },
  Cholesterol: { min: 125, max: 200, unit: 'mg/dL', color: '#EF4444' },
  Creatinine: { min: 0.7, max: 1.4, unit: 'mg/dL', color: '#EC4899' },
  Hematocrit: { min: 40, max: 50, unit: '%', color: '#14B8A6' },
};

function getRiskLevel(value: number, norm: { min: number; max: number }) {
  if (value < norm.min * 0.8 || value > norm.max * 1.2) return 'critical';
  if (value < norm.min || value > norm.max) return 'borderline';
  return 'normal';
}

const RISK_COLORS: Record<string, { bg: string; text: string; badge: string; label: string }> = {
  normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-500', label: 'Normal' },
  borderline: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-500', label: 'Borderline' },
  critical: { bg: 'bg-rose-50', text: 'text-rose-700', badge: 'bg-rose-500', label: 'Critical' },
};

export default function PatientAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [selectedBiomarker, setSelectedBiomarker] = useState('Glucose');

  useEffect(() => {
    if (!authLoading && (user?.id || user?._id)) {
      reportService.getPatientReports()
        .then(data => setReports(Array.isArray(data) ? data : []))
        .catch(() => setReports([]))
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Build time-filtered subset
  const filteredReports = reports.filter(r => {
    if (timeFilter === 'All Time') return true;
    const months = timeFilter === '3 Months' ? 3 : timeFilter === '6 Months' ? 6 : 12;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    return new Date(r.uploadDate) >= cutoff;
  }).sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());

  // Aggregate biomarker trends from all reports
  const buildTrend = (biomarker: string) => {
    return filteredReports
      .filter(r => r.extractedData?.[biomarker] !== undefined)
      .map(r => ({
        label: new Date(r.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: typeof r.extractedData[biomarker] === 'number'
          ? r.extractedData[biomarker]
          : parseFloat(r.extractedData[biomarker]) || 0,
      }));
  };

  // Risk distribution
  const riskCounts = { normal: 0, borderline: 0, critical: 0 };
  reports.forEach(r => {
    if (!r.extractedData) return;
    Object.entries(r.extractedData).forEach(([key, val]) => {
      const norm = BIOMARKER_NORMS[key];
      if (!norm || typeof val !== 'number') return;
      const risk = getRiskLevel(val, norm);
      riskCounts[risk]++;
    });
  });

  const pieData = [
    { name: 'Normal', value: riskCounts.normal, color: '#10B981' },
    { name: 'Borderline', value: riskCounts.borderline, color: '#F59E0B' },
    { name: 'Critical', value: riskCounts.critical, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // Latest biomarker snapshot
  const latestSnapshot: { key: string; value: number; norm: typeof BIOMARKER_NORMS[string]; risk: string }[] = [];
  const latestReport = [...reports].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())[0];
  if (latestReport?.extractedData) {
    Object.entries(latestReport.extractedData).forEach(([key, val]) => {
      const norm = BIOMARKER_NORMS[key];
      if (norm && typeof val === 'number') {
        latestSnapshot.push({ key, value: val, norm, risk: getRiskLevel(val, norm) });
      }
    });
  }

  // Available biomarkers for trend chart
  const availableBiomarkers = Object.keys(BIOMARKER_NORMS).filter(bm =>
    reports.some(r => r.extractedData?.[bm] !== undefined)
  );

  const trendData = buildTrend(selectedBiomarker);
  const selectedNorm = BIOMARKER_NORMS[selectedBiomarker];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patient" className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#4F6F6F] hover:bg-[#F6F7F5] transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Health Analytics</h1>
            <p className="text-[#6B7280] mt-1 font-medium">Track biomarker trends and risk indicators over time.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-2xl p-1 shadow-sm">
          {TIME_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${timeFilter === f ? 'bg-[#4F6F6F] text-white shadow-md' : 'text-[#6B7280] hover:text-[#1F2933]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: '📄', color: 'text-[#1F2933]' },
          { label: 'Biomarkers Tracked', value: latestSnapshot.length, icon: '🔬', color: 'text-[#4F6F6F]' },
          { label: 'Normal Values', value: riskCounts.normal, icon: '✅', color: 'text-emerald-600' },
          { label: 'Needs Attention', value: riskCounts.borderline + riskCounts.critical, icon: '⚠️', color: riskCounts.critical > 0 ? 'text-rose-600' : 'text-amber-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">{stat.label}</p>
            <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biomarker Trend Chart - takes 2/3 width */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-[#1F2933]">Biomarker Trend</h3>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                {trendData.length > 0 ? `${trendData.length} data points`: 'Upload reports to see trends'}
              </p>
            </div>
            {availableBiomarkers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableBiomarkers.map(bm => (
                  <button
                    key={bm}
                    onClick={() => setSelectedBiomarker(bm)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${selectedBiomarker === bm
                      ? 'text-white shadow-md'
                      : 'bg-[#F6F7F5] text-[#6B7280] hover:bg-[#E2E8F0]'
                    }`}
                    style={selectedBiomarker === bm ? { background: BIOMARKER_NORMS[bm]?.color || '#4F6F6F' } : {}}
                  >
                    {bm}
                  </button>
                ))}
              </div>
            )}
          </div>

          {trendData.length >= 2 ? (
            <AnalyticsChart
              data={trendData}
              color={selectedNorm?.color || '#4F6F6F'}
              type="area"
              height={240}
              unit={selectedNorm?.unit || ''}
              referenceRange={selectedNorm ? { min: selectedNorm.min, max: selectedNorm.max } : undefined}
            />
          ) : trendData.length === 1 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl font-black"
                style={{ background: selectedNorm?.color || '#4F6F6F' }}>
                {trendData[0].value}
              </div>
              <p className="text-sm font-bold text-[#6B7280]">
                Latest: <span className="text-[#1F2933] font-black">{trendData[0].value} {selectedNorm?.unit}</span>
              </p>
              <p className="text-xs text-[#94A3B8] font-medium">Upload more reports to see trend chart</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
              <div className="w-14 h-14 bg-[#F6F7F5] rounded-3xl flex items-center justify-center text-2xl">📊</div>
              <p className="font-black text-[#1F2933]">No {selectedBiomarker} data yet</p>
              <p className="text-xs text-[#6B7280] font-medium">Upload lab reports with blood panel results to see trends here.</p>
              <Link href="/dashboard/patient" className="mt-2 text-xs font-black text-[#4F6F6F] hover:underline">
                Upload a Report →
              </Link>
            </div>
          )}
        </div>

        {/* Risk Distribution Pie */}
        <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-[#1F2933] mb-2">Risk Distribution</h3>
          <p className="text-xs text-[#6B7280] font-medium mb-6">Across all biomarker readings</p>

          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1F2933', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-sm font-bold text-[#1F2933]">{d.name}</span>
                    </div>
                    <span className="text-sm font-black text-[#4F6F6F]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center">
              <div className="w-14 h-14 bg-[#F6F7F5] rounded-3xl flex items-center justify-center text-2xl">🥧</div>
              <p className="text-sm font-bold text-[#6B7280]">No biomarker data</p>
              <p className="text-xs text-[#94A3B8]">Risk distribution will appear once reports are processed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Glucose & Hemoglobin Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {['Glucose', 'Hemoglobin'].map(bm => {
          const bmData = buildTrend(bm);
          const norm = BIOMARKER_NORMS[bm];
          return (
            <div key={bm} className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#1F2933]">{bm} Trend</h3>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    Normal range: {norm.min}–{norm.max} {norm.unit}
                  </p>
                </div>
                {bmData.length > 0 && (() => {
                  const latest = bmData[bmData.length - 1].value;
                  const risk = getRiskLevel(latest, norm);
                  const rc = RISK_COLORS[risk];
                  return (
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${rc.bg} ${rc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rc.badge}`} />
                      {rc.label}
                    </span>
                  );
                })()}
              </div>
              {bmData.length >= 1 ? (
                <AnalyticsChart
                  data={bmData}
                  color={norm.color}
                  type="line"
                  height={160}
                  unit={norm.unit}
                  referenceRange={{ min: norm.min, max: norm.max }}
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-center gap-2 flex-col">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ background: norm.color }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <p className="text-sm font-bold text-[#6B7280]">No {bm} data yet</p>
                  <p className="text-xs text-[#94A3B8]">Upload a blood panel report to track this biomarker</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Biomarker Snapshot Table */}
      {latestSnapshot.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#F6F7F5] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#1F2933]">Latest Biomarker Snapshot</h3>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                From: {latestReport?.reportName} · {new Date(latestReport?.uploadDate).toLocaleDateString()}
              </p>
            </div>
            <Link
              href={`/dashboard/patient/reports/${latestReport?._id}`}
              className="text-xs font-black text-[#4F6F6F] hover:underline flex items-center gap-1"
            >
              View Report
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F6F7F5]">
                <tr>
                  {['Biomarker', 'Value', 'Normal Range', 'Unit', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-black text-[#6B7280] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F7F5]">
                {latestSnapshot.map(({ key, value, norm, risk }) => {
                  const rc = RISK_COLORS[risk];
                  const pct = Math.min(100, Math.max(0, ((value - norm.min) / (norm.max - norm.min)) * 100));
                  return (
                    <tr key={key} className="hover:bg-[#F6F7F5] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: BIOMARKER_NORMS[key]?.color || '#4F6F6F' }} />
                          <span className="font-black text-[#1F2933] text-sm">{key}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-[#1F2933]">{value}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[#F6F7F5] rounded-full overflow-hidden w-24">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: risk === 'normal' ? '#10B981' : risk === 'borderline' ? '#F59E0B' : '#EF4444'
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#6B7280] whitespace-nowrap">{norm.min}–{norm.max}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280] font-medium">{norm.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 w-fit ${rc.bg} ${rc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rc.badge}`} />
                          {rc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state for no reports */}
      {reports.length === 0 && (
        <div className="bg-white py-24 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
          <div className="w-20 h-20 bg-[#F6F7F5] rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📊</div>
          <h3 className="text-xl font-black text-[#1F2933]">No Reports Yet</h3>
          <p className="text-[#6B7280] font-medium mt-2 max-w-sm mx-auto">
            Upload your lab reports to unlock health analytics, biomarker tracking, and trend charts.
          </p>
          <Link
            href="/dashboard/patient"
            className="inline-flex items-center gap-2 mt-6 bg-[#4F6F6F] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1F2933] transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
