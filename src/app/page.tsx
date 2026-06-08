"use client";

import { COLORS, DashboardStats } from "@/types/base-types";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";


export default function DashboardPage() {
  const defaultDates = useMemo(() => {
    const now = new Date();
    const endD = now;
    const startD = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    
    return {
      start: `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, "0")}`,
      end: `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, "0")}`,
    };
  }, []);

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  const availableMonths = useMemo(() => {
    const months = [];
    const start = new Date(2025, 0, 1); // 2025-01
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let current = new Date(start);
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, "0");
      months.push(`${y}-${m}`);
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }, []);

  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", { startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const queryStr = params.toString();
      const url = `/api/dashboard-stats${queryStr ? `?${queryStr}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
  });

  if (isLoading) return <div className="p-8 text-foreground">Loading dashboard...</div>;
  if (error || !data) return <div className="p-8 text-red-400">Error loading dashboard</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kender Dashboard</h1>
          <p className="text-gray-400 mt-2">Comprehensive carbon emission analytics</p>
        </div>
        
        {/* 기간 필터 컨트롤러 */}
        <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-border self-start sm:self-auto">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium mb-1">시작 월</span>
            <select
              value={startDate}
              onChange={(e) => {
                const val = e.target.value;
                setStartDate(val);
                if (endDate && val > endDate) {
                  setEndDate(val);
                }
              }}
              className="bg-background text-foreground border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
            >
              {availableMonths.map((m) => (
                <option key={`start-${m}`} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <span className="text-gray-400 self-end mb-2">~</span>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium mb-1">종료 월</span>
            <select
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background text-foreground border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-primary"
            >
              {availableMonths.map((m) => (
                <option key={`end-${m}`} value={m} disabled={m < startDate}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-xl p-6 border border-border">
          <h3 className="text-sm font-medium text-gray-400">Total Emissions</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.totalEmissions.toFixed(2)} tCO2e</p>
        </div>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <h3 className="text-sm font-medium text-gray-400">Cradle to Gate PCF</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.cradleToGatePcf.toFixed(4)} tCO2e/unit</p>
        </div>
        <div className="bg-surface rounded-xl p-6 border border-border">
          <h3 className="text-sm font-medium text-gray-400">Cradle to Grave PCF</h3>
          <p className="text-3xl font-bold text-primary mt-2">{data.cradleToGravePcf.toFixed(4)} tCO2e/unit</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scope Chart */}
        <div className="bg-surface rounded-xl p-6 border border-border h-96 flex flex-col">
          <h3 className="text-lg font-medium text-foreground mb-4">Emissions by Scope</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.emissionsByScope}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {data.emissionsByScope.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1c241f", borderColor: "#2f3b33", color: "#e8edea" }}
                  formatter={(value: unknown) => {
                    const num = typeof value === "number" ? value : Number(value);
                    return [`${num.toFixed(2)} tCO2e`, "Emissions"];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Chart */}
        <div className="bg-surface rounded-xl p-6 border border-border h-96 flex flex-col">
          <h3 className="text-lg font-medium text-foreground mb-4">Emissions by Company</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.emissionsByCompany} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3b33" vertical={false} />
                <XAxis dataKey="name" stroke="#a0aab2" tick={{ fill: "#a0aab2" }} />
                <YAxis stroke="#a0aab2" tick={{ fill: "#a0aab2" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1c241f", borderColor: "#2f3b33", color: "#e8edea" }}
                  formatter={(value: unknown) => {
                    const num = typeof value === "number" ? value : Number(value);
                    return [`${num.toFixed(2)} tCO2e`, "Emissions"];
                  }}
                />
                <Bar dataKey="value" fill="#4edea3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PCF Stage Chart */}
        <div className="bg-surface rounded-xl p-6 border border-border h-96 flex flex-col lg:col-span-2">
          <h3 className="text-lg font-medium text-foreground mb-4">Emissions by Lifecycle Stage</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.emissionsByPcfStage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3b33" vertical={false} />
                <XAxis dataKey="name" stroke="#a0aab2" tick={{ fill: "#a0aab2" }} />
                <YAxis stroke="#a0aab2" tick={{ fill: "#a0aab2" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1c241f", borderColor: "#2f3b33", color: "#e8edea" }}
                  formatter={(value: unknown) => {
                    const num = typeof value === "number" ? value : Number(value);
                    return [`${num.toFixed(2)} tCO2e`, "Emissions"];
                  }}
                />
                <Bar dataKey="value" fill="#8ab4f8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Emissions Chart */}
        <div className="bg-surface rounded-xl p-6 border border-border h-96 flex flex-col lg:col-span-2">
          <h3 className="text-lg font-medium text-foreground mb-4">
            Monthly Emissions ({startDate && endDate ? `${startDate} ~ ${endDate}` : "Last 12 Months"})
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.emissionsByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f3b33" vertical={false} />
                <XAxis dataKey="name" stroke="#a0aab2" tick={{ fill: "#a0aab2" }} />
                <YAxis stroke="#a0aab2" tick={{ fill: "#a0aab2" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1c241f", borderColor: "#2f3b33", color: "#e8edea" }}
                  formatter={(value: unknown) => {
                    const num = typeof value === "number" ? value : Number(value);
                    return [`${num.toFixed(2)} tCO2e`, "Emissions"];
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#e9c46a" strokeWidth={3} dot={{ r: 4, fill: "#e9c46a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
