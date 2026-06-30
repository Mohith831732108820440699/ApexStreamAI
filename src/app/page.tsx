"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Tv,
  Cpu,
  Database,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  StopCircle,
  RefreshCw,
  HardDrive
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";

interface Stream {
  id: string;
  title: string;
  video: string;
  channels: string[];
  scheduledTime: string;
  status: string;
  fps: number;
  bitrate: number;
  resolution: string;
  uptime: string;
  frameDrops: number;
  networkStatus: string;
  retryCount: number;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [system, setSystem] = useState({
    cpuUsage: 42.5,
    ramUsage: 58.2,
    storageUsage: 31.8,
    redisQueue: 0,
    activeWorkers: 4,
    ffmpegProcesses: 2
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // CPU history for charts
  const [cpuHistory, setCpuHistory] = useState([
    { name: "10m", cpu: 38, ram: 55 },
    { name: "8m", cpu: 45, ram: 56 },
    { name: "6m", cpu: 41, ram: 57 },
    { name: "4m", cpu: 52, ram: 58 },
    { name: "2m", cpu: 40, ram: 58 },
    { name: "Now", cpu: 42, ram: 58 }
  ]);

  const fetchState = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/stream-engine");
      const data = await res.json();
      setStreams(data.streams);
      setLogs(data.logs);
      setSystem(data.system);
      
      // Append current CPU to history
      setCpuHistory(prev => {
        const next = [...prev.slice(1)];
        next.push({
          name: "Now",
          cpu: Math.round(data.system.cpuUsage),
          ram: Math.round(data.system.ramUsage)
        });
        return next;
      });
    } catch (e) {
      console.error("Error fetching state:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchState();
    
    // Poll metrics every 6 seconds
    const interval = setInterval(() => {
      fetchState();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const triggerAction = async (action: string, streamId?: string) => {
    try {
      await fetch("/api/stream-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, streamId })
      });
      fetchState();
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">StreamTest AI Dashboard</h1>
          <p className="text-slate-400 mt-1">Real-time status monitoring, streaming nodes health, and testing reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerAction("reset")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-[var(--border)] hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            Reset Simulator
          </button>
          <button
            onClick={fetchState}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-colors gap-2 shadow-lg glow-primary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Syncing..." : "Refresh Status"}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity className="w-16 h-16 text-primary" />
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Streams</p>
          <p className="text-3xl font-bold text-white mt-2">
            {streams.filter(s => s.status === "streaming").length}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-success mt-3 font-medium">
            <span className="w-2 h-2 rounded-full bg-success glow-pulse" />
            Live Sandbox Connected
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Tv className="w-16 h-16 text-secondary" />
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Connected Channels</p>
          <p className="text-3xl font-bold text-white mt-2">2 <span className="text-sm font-normal text-slate-400">/ 6 max</span></p>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-secondary" />
            YouTube, Facebook linked
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Layers className="w-16 h-16 text-success" />
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Queue Workers</p>
          <p className="text-3xl font-bold text-white mt-2">
            {system.activeWorkers} <span className="text-sm font-normal text-slate-400">online</span>
          </p>
          <p className="text-xs text-success mt-3 font-medium">
            BullMQ tasks: {system.redisQueue} pending
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <HardDrive className="w-16 h-16 text-warning" />
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Storage Usage</p>
          <p className="text-3xl font-bold text-white mt-2">
            {system.storageUsage.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            1.59 GB of 5.00 GB trial limit
          </p>
        </div>
      </div>

      {/* Main Grid: Streaming Sandbox & System resource chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Streams list (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Active Stream Validations
              </h2>
              <span className="text-xs text-slate-400 font-semibold">Sandbox Environment</span>
            </div>

            <div className="space-y-4">
              {streams.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No streams currently active.</p>
              ) : (
                streams.map(stream => (
                  <div key={stream.id} className="p-5 rounded-xl bg-slate-900/40 border border-[var(--border)] hover:border-slate-700 transition-colors space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white text-base">{stream.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Asset: {stream.video} | ID: {stream.id}</p>
                      </div>
                      
                      {/* Badge status */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit flex items-center gap-1.5 ${
                        stream.status === "streaming" 
                          ? "bg-success/10 text-success border border-success/20" 
                          : "bg-danger/10 text-danger border border-danger/20 glow-pulse"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stream.status === "streaming" ? "bg-success animate-pulse" : "bg-danger"}`} />
                        {stream.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-y border-[var(--border)/5] text-xs">
                      <div>
                        <p className="text-slate-400">Resolution / FPS</p>
                        <p className="font-semibold text-white mt-1">{stream.resolution} @ {stream.fps}fps</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Bitrate</p>
                        <p className="font-semibold text-white mt-1">{(stream.bitrate / 1000).toFixed(2)} Mbps</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Uptime</p>
                        <p className="font-semibold text-white mt-1">{stream.uptime}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Dropped Frames</p>
                        <p className={`font-semibold mt-1 ${stream.frameDrops > 10 ? "text-warning" : "text-white"}`}>
                          {stream.frameDrops} frames
                        </p>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Outputs:</span>
                        {stream.channels.map(ch => (
                          <span key={ch} className="px-2 py-0.5 rounded bg-white/5 border border-[var(--border)] text-white text-[10px]">
                            {ch}
                          </span>
                        ))}
                        {stream.retryCount > 0 && (
                          <span className="text-warning font-semibold ml-2">
                            ({stream.retryCount} auto-recoveries)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {stream.status === "streaming" ? (
                          <button
                            onClick={() => triggerAction("crash_worker", stream.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Simulate Node Crash
                          </button>
                        ) : (
                          <button
                            onClick={() => triggerAction("recover_worker", stream.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/10 hover:bg-success/20 text-success border border-success/20 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Trigger Auto Recovery
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Infrastructure Metrics charts */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-secondary" />
              Infrastructure Resource Monitoring
            </h2>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cpuHistory}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#f8fafc"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    name="CPU Usage %"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorCpu)"
                  />
                  <Area
                    type="monotone"
                    dataKey="ram"
                    name="RAM Usage %"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorRam)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                FFmpeg Pods (CPU)
              </div>
              <div className="flex items-center gap-1.5 text-secondary">
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
                Redis & Core Service (RAM)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Engine Logs & Quick Links (1/3 width) */}
        <div className="space-y-6">
          {/* Logs panel */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-warning" />
              Stream Logs Feed
            </h2>
            <div className="flex-1 overflow-y-auto bg-slate-950/50 rounded-xl p-4 font-mono text-[10px] space-y-2 border border-[var(--border)] leading-relaxed scrollbar-thin">
              {logs.map((log, index) => (
                <div key={index} className={`whitespace-pre-wrap ${
                  log.includes("[CRITICAL]") 
                    ? "text-danger" 
                    : log.includes("[WARN]") 
                      ? "text-warning" 
                      : log.includes("[RECOVERY]") 
                        ? "text-success font-semibold" 
                        : "text-slate-300"
                }`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nav Tools */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Agent Validation Shortcuts</h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/auth-testing"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/2 hover:bg-white/5 border border-[var(--border)] text-xs transition-all duration-200 text-slate-300 hover:text-white"
              >
                <span>Authentication Workflows</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
              <Link
                href="/security-scanner"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/2 hover:bg-white/5 border border-[var(--border)] text-xs transition-all duration-200 text-slate-300 hover:text-white"
              >
                <span>OWASP Security Scanner</span>
                <ArrowRight className="w-4 h-4 text-success" />
              </Link>
              <Link
                href="/load-tester"
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/2 hover:bg-white/5 border border-[var(--border)] text-xs transition-all duration-200 text-slate-300 hover:text-white"
              >
                <span>Performance Load Testing</span>
                <ArrowRight className="w-4 h-4 text-warning" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
