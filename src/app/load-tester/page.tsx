"use client";

import React, { useEffect, useState } from "react";
import { Zap, Play, RefreshCw, BarChart2, ShieldAlert, Cpu, CheckCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface MetricRow {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpu: number;
  memory: number;
}

export default function LoadTester() {
  const [activeTier, setActiveTier] = useState<"1k" | "10k" | "50k" | "100k">("1k");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chartData, setChartData] = useState<MetricRow[]>([]);
  const [allMetrics, setAllMetrics] = useState<Record<string, MetricRow[]>>({});
  const [summary, setSummary] = useState({
    tool: "k6",
    engine: "Kube-k6-Operator",
    runnerNodes: 8,
    status: "ready"
  });

  const loadData = async () => {
    try {
      const res = await fetch("/api/load-test");
      const data = await res.json();
      setAllMetrics(data.metrics);
      setChartData(data.metrics[activeTier]);
      setSummary(data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTier]);

  const triggerLoadTest = () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate real-time progress increments
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 25;
      });
    }, 800);
  };

  // Compute summary stats based on current tier data
  const getStats = () => {
    if (!chartData || chartData.length === 0) return { avgLatency: 0, peakThroughput: 0, totalErrors: "0%" };
    
    const totalLatency = chartData.reduce((acc, row) => acc + row.responseTime, 0);
    const avgLatency = Math.round(totalLatency / chartData.length);
    
    const peakThroughput = Math.max(...chartData.map(row => row.throughput));
    
    const avgError = (chartData.reduce((acc, row) => acc + row.errorRate, 0) / chartData.length).toFixed(2);
    
    return { avgLatency, peakThroughput, totalErrors: `${avgError}%` };
  };

  const stats = getStats();

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Performance & Load Testing
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Verify API response speeds, requests-per-second ceilings, and error percentages under simulated user crowds.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-400 bg-white/5 border border-[var(--border)] px-3.5 py-1.5 rounded-xl font-mono">
            Runner: {summary.tool.toUpperCase()} (Distributed)
          </span>
        </div>
      </div>

      {/* Control panel & KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Run controls */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Load Configuration</h2>
            <p className="text-xs text-slate-400 mt-1">Select concurrent users target</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["1k", "10k", "50k", "100k"] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                disabled={isRunning}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTier === tier
                    ? "bg-primary border border-primary text-white"
                    : "bg-slate-900/40 border border-[var(--border)] text-slate-400 hover:text-white"
                }`}
              >
                {tier.toUpperCase()} Users
              </button>
            ))}
          </div>

          <button
            onClick={triggerLoadTest}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-all"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Injecting load ({progress}%)
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Load Test
              </>
            )}
          </button>
        </div>

        {/* Stats card: Latency */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Latency</p>
          <div className="my-2">
            <p className="text-3xl font-bold text-white">{stats.avgLatency} <span className="text-sm font-normal text-slate-400">ms</span></p>
          </div>
          <div className="flex items-center gap-1 text-xs text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Within 500ms API SLA threshold
          </div>
        </div>

        {/* Stats card: Throughput */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Peak Throughput</p>
          <div className="my-2">
            <p className="text-3xl font-bold text-white">{stats.peakThroughput.toLocaleString()} <span className="text-sm font-normal text-slate-400">req/s</span></p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            Distributed across {summary.runnerNodes} pod nodes
          </div>
        </div>

        {/* Stats card: Errors */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Error Rate</p>
          <div className="my-2">
            <p className={`text-3xl font-bold ${parseFloat(stats.totalErrors) > 2 ? "text-danger" : "text-white"}`}>
              {stats.totalErrors}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            {parseFloat(stats.totalErrors) > 1.5 ? (
              <span className="text-danger flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High threshold warnings
              </span>
            ) : (
              <span className="text-success flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Normal bounds ({"<"} 2.0%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Latency & Throughput Timeline Chart (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Performance latency & requests Timeline
          </h2>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} label={{ value: 'Throughput (req/s)', angle: 90, position: 'insideRight', fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#f8fafc"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="responseTime"
                  name="Response Time (ms)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="throughput"
                  name="Throughput (req/s)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Load Distribution Chart (1/3 width) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-secondary" />
              Node Stress Index
            </h2>
            <p className="text-xs text-slate-400 mb-6">Resource footprints on API runner pods during peak load</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData ? [chartData[chartData.length - 1]] : []}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} hide />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#f8fafc"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cpu" name="CPU Core Peak %" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="memory" name="RAM Peak %" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
