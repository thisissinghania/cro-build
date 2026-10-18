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
  Legend
} from "recharts";

const mockData = {
  "2026": [
    { name: "Jan", revenue: 0, users: 40, audits: 240 },
    { name: "Feb", revenue: 0, users: 50, audits: 300 },
    { name: "Mar", revenue: 0, users: 65, audits: 450 },
    { name: "Apr", revenue: 0, users: 80, audits: 600 },
    { name: "May", revenue: 0, users: 95, audits: 750 },
    { name: "Jun", revenue: 0, users: 110, audits: 900 },
    { name: "Jul", revenue: 0, users: 125, audits: 1050 },
    { name: "Aug", revenue: 0, users: 142, audits: 1204 },
    { name: "Sep", revenue: 0, users: 155, audits: 1350 },
    { name: "Oct", revenue: 0, users: 170, audits: 1500 },
    { name: "Nov", revenue: 0, users: 190, audits: 1700 },
    { name: "Dec", revenue: 0, users: 210, audits: 1900 },
  ],
  "2025": [
    { name: "Jan", revenue: 0, users: 20, audits: 100 },
    { name: "Feb", revenue: 0, users: 25, audits: 120 },
    { name: "Mar", revenue: 0, users: 30, audits: 150 },
    { name: "Apr", revenue: 0, users: 35, audits: 180 },
    { name: "May", revenue: 0, users: 40, audits: 200 },
    { name: "Jun", revenue: 0, users: 45, audits: 220 },
    { name: "Jul", revenue: 0, users: 50, audits: 250 },
    { name: "Aug", revenue: 0, users: 60, audits: 300 },
    { name: "Sep", revenue: 0, users: 70, audits: 350 },
    { name: "Oct", revenue: 0, users: 80, audits: 400 },
    { name: "Nov", revenue: 0, users: 95, audits: 480 },
    { name: "Dec", revenue: 0, users: 110, audits: 550 },
  ],
};

export function PlatformChart() {
  const years = Object.keys(mockData).sort((a, b) => Number(b) - Number(a));
  const [year, setYear] = useState<string>(years[0]);

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 p-6 flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Platform Growth</h2>
          <p className="text-sm text-zinc-500 mt-1">Platform Activity & Free Access Growth (Audits & Integrations)</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData[year as keyof typeof mockData]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAudits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={(val) => `$${val.toLocaleString()}`} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }}
              itemStyle={{ fontWeight: 500 }}
              labelStyle={{ color: '#71717a', marginBottom: '4px' }}
              formatter={(value: any, name: any) => {
                if (name === "MRR (Revenue)") return [`$${value.toLocaleString()}`, name];
                return [value.toLocaleString(), name];
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} iconType="circle" />
            
            <Area yAxisId="left" type="monotone" name="MRR (Revenue)" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            <Area yAxisId="right" type="monotone" name="AI Audits" dataKey="audits" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorAudits)" />
            <Area yAxisId="right" type="monotone" name="Active Integrations" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
