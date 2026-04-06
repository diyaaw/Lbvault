'use client';

import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { AnalyticsData } from '@/types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#4F6F6F', '#8FB9A8', '#1F2933', '#B8D8C8', '#6B7280'];
const TIME_FILTERS = ['7 Days', '30 Days', '3 Months', '1 Year'];

export default function PathologyAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7 Days');

  useEffect(() => {
    analyticsService.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const weeklyData = (data?.weeklyVolume || [120, 150, 180, 140, 200, 170, 190]).map((v, i) => ({
    day: DAYS[i] || `Day ${i + 1}`,
    reports: v,
    avg: Math.round(v * 0.85),
  }));

  const testTypeData = (data?.testTypes || [
    { name: 'CBC', count: 420 },
    { name: 'Lipid Profile', count: 280 },
    { name: 'Thyroid', count: 185 },
    { name: 'Glucose', count: 310 },
    { name: 'Urine', count: 95 },
  ]);

  const trendData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
    month: m,
    patients: Math.round((data?.totalPatients ?? 300) * (0.6 + i * 0.08)),
    reports: Math.round((data?.totalReports ?? 1200) * (0.5 + i * 0.1)),
  }));

  const riskData = [
    { name: 'Normal', value: Math.round((data?.totalReports ?? 1200) * 0.65), color: '#8FB9A8' },
    { name: 'Borderline', value: Math.round((data?.totalReports ?? 1200) * 0.22), color: '#F59E0B' },
    { name: 'Critical', value: Math.round((data?.totalReports ?? 1200) * 0.13), color: '#EF4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Lab Analytics</h1>
          <p className="text-[#6B7280] mt-1 font-medium">Clinical performance insights and diagnostic trends.</p>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Reports', value: data?.totalReports ?? 1250, icon: '📄', change: '+12%', changeUp: true },
          { label: 'Total Patients', value: data?.totalPatients ?? 450, icon: '👥', change: '+8%', changeUp: true },
          { label: 'Patient Growth', value: `${data?.patientGrowthRate ?? 12.5}%`, icon: '📈', change: '+2.1%', changeUp: true },
          { label: 'Efficiency Rate', value: `${data?.efficiencyRate ?? 94}%`, icon: '⚡', change: '-1%', changeUp: false },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full ${stat.changeUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-[#1F2933] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Report Volume - Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-lg font-black text-[#1F2933] mb-6">Weekly Report Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F6F7F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1F2933', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                cursor={{ fill: '#F6F7F5', radius: 8 }}
              />
              <Bar dataKey="reports" fill="#4F6F6F" radius={[6, 6, 0, 0]} name="Reports" />
              <Bar dataKey="avg" fill="#8FB9A8" radius={[6, 6, 0, 0]} name="Avg" opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patient & Report Trends - Area Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-lg font-black text-[#1F2933] mb-6">Patient & Report Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F6F6F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F6F6F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8FB9A8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8FB9A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F6F7F5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1F2933', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
              <Area type="monotone" dataKey="patients" stroke="#4F6F6F" strokeWidth={2.5} fill="url(#patGrad)" name="Patients" />
              <Area type="monotone" dataKey="reports" stroke="#8FB9A8" strokeWidth={2.5} fill="url(#repGrad)" name="Reports" />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Type Distribution */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-lg font-black text-[#1F2933] mb-6">Test Type Distribution</h3>
          <div className="space-y-4">
            {testTypeData.map((test: any, i: number) => {
              const total = testTypeData.reduce((s: number, t: any) => s + t.count, 0);
              const pct = Math.round((test.count / total) * 100);
              return (
                <div key={test.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-sm font-bold text-[#1F2933]">{test.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-[#4F6F6F]">{test.count}</span>
                      <span className="text-xs font-black text-[#6B7280] w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-[#F6F7F5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
          <h3 className="text-lg font-black text-[#1F2933] mb-6">Risk Indicators</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {riskData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1F2933', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {riskData.map(r => (
              <div key={r.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                  <span className="text-sm font-bold text-[#1F2933]">{r.name}</span>
                </div>
                <span className="text-sm font-black text-[#4F6F6F]">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download CTA */}
      <div className="bg-gradient-to-r from-[#1F2933] to-[#4F6F6F] rounded-3xl p-10 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black mb-2">Monthly Performance Audit</h2>
            <p className="text-[#8FB9A8] font-medium">Download the full diagnostic report for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
          </div>
          <button className="bg-[#8FB9A8] text-[#1F2933] px-8 py-3.5 rounded-2xl font-black hover:bg-white transition-all shadow-lg inline-flex items-center gap-2 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
