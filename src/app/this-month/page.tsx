"use client";

import { COLORS, DashboardStats } from "@/types/base-types";
import { useQuery } from "@tanstack/react-query";
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
  Cell
} from "recharts";



export default function ThisMonthPage() {
  const d = new Date();
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", currentMonth],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard-stats?month=${currentMonth}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
  });

  if (isLoading) return <div className="p-8 text-foreground">Loading dashboard...</div>;
  if (error || !data) return <div className="p-8 text-red-400">Error loading dashboard</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">This Month&apos;s Emissions</h1>
        <p className="text-gray-400 mt-2">Carbon emission analytics for {currentMonth}</p>
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

      </div>
    </div>
  );
}
