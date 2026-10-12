"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ShieldCheck } from "lucide-react";

interface AuditDataPoint {
  id: string;
  websiteUrl: string;
  overallScore: number;
  recommendationsCount: number;
  createdAt: string;
}

interface UserChartProps {
  websites?: string[];
  audits?: AuditDataPoint[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AVAILABLE_YEARS = ["2026", "2025"];

export function UserChart({ websites = [], audits = [] }: UserChartProps) {
  const [activeWebsite, setActiveWebsite] = useState<string>(websites[0] || "ALL");
  const [selectedYear, setSelectedYear] = useState<string>("2026");

  // Keep activeWebsite valid if websites list changes
  const currentWebsite =
    activeWebsite === "ALL" || websites.includes(activeWebsite)
      ? activeWebsite
      : websites[0] || "ALL";

  // Filter audits for selected website
  const websiteAudits = audits.filter(
    (a) => currentWebsite === "ALL" || a.websiteUrl === currentWebsite
  );

  // Latest audit for badge metrics
  const latestAudit = websiteAudits[0];
  const currentScore = latestAudit ? latestAudit.overallScore : 0;
  const currentBlockers = latestAudit ? latestAudit.recommendationsCount : 0;

  // Audits specifically in the selected year
  const yearAudits = websiteAudits.filter(
    (a) => new Date(a.createdAt).getFullYear().toString() === selectedYear
  );

  // Build 12-month data points strictly from real database audits
  const monthlyData = MONTHS.map((monthName, monthIndex) => {
    // Check if there are real audits in this specific month
    const auditsInMonth = yearAudits.filter(
      (a) => new Date(a.createdAt).getMonth() === monthIndex
    );

    if (auditsInMonth.length > 0) {
      // Direct real audit data from PostgreSQL
      const latestInMonth = auditsInMonth[0];
      return {
        name: monthName,
        score: latestInMonth.overallScore,
        issues: latestInMonth.recommendationsCount,
        hasAudit: true,
      };
    }

    // Pure real data: month has 0 if no audit occurred in this month
    return {
      name: monthName,
      score: 0,
      issues: 0,
      hasAudit: false,
    };
  });

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 p-6 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      {/* Chart Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Conversion Health & Optimization
          </h2>
          <p className="text-[16px] text-zinc-500 mt-1">
            Track your AI audit scores and resolved conversion blockers over time.
          </p>

          {latestAudit && (
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                <span className="text-[14px] font-semibold text-emerald-700">
                  Current Score: {currentScore}/100
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
                <div className="w-2 h-2 rounded-sm bg-rose-500" />
                <span className="text-[14px] font-semibold text-rose-700">
                  {currentBlockers} Conversion Blockers
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filter Controls: Website & Year */}
        <div className="flex items-center gap-3 flex-wrap">
          {websites.length > 0 && (
            <div className="relative">
              <select
                value={currentWebsite}
                onChange={(e) => setActiveWebsite(e.target.value)}
                className="h-[42px] px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer min-w-[200px]"
              >
                {websites.length > 1 && <option value="ALL">All Websites</option>}
                {websites.map((website) => (
                  <option key={website} value={website}>
                    {website}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-[42px] px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer min-w-[100px]"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Body */}
      {websites.length === 0 ? (
        <div className="py-16 text-center text-zinc-500">
          <p className="text-[16px] mb-2 font-medium">No connected websites yet.</p>
          <p className="text-sm text-zinc-400">
            Connect a website from Integrations to start tracking conversion health.
          </p>
        </div>
      ) : audits.length === 0 ? (
        <div className="py-16 text-center text-zinc-500">
          <p className="text-[16px] mb-2 font-medium">No audits recorded yet.</p>
          <p className="text-sm text-zinc-400">
            Run an AI audit in the Integrations tab to view your score trend.
          </p>
        </div>
      ) : (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f4f4f5"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e4e4e7",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "13px",
                }}
                itemStyle={{ fontWeight: 500 }}
                labelStyle={{ color: "#71717a", marginBottom: "4px" }}
                formatter={(value: any, name: any, item: any) => {
                  const hasAudit = item?.payload?.hasAudit;
                  if (!hasAudit) {
                    return ["0 (No audit conducted)", name];
                  }
                  if (name === "Conversion Health Score") return [`${value}/100`, name];
                  if (name === "Conversion Blockers") return [`${value} blockers`, name];
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }}
                iconType="circle"
              />

              <Area
                yAxisId="left"
                type="monotone"
                name="Conversion Health Score"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScore)"
                dot={{ r: 3, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                name="Conversion Blockers"
                dataKey="issues"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIssues)"
                dot={{ r: 3, fill: "#f43f5e" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
