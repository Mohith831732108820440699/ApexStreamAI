"use client";

import React, { useEffect, useState } from "react";
import { Activity, Play, AlertOctagon, RefreshCw, Terminal, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

export default function StreamingTesting() {
  const [engineState, setEngineState] = useState<"streaming" | "failed" | "retrying" | "recovered">("streaming");
  const [retryCount, setRetryCount] = useState(0);
  const [backoffDelay, setBackoffDelay] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "[16:54:10] [Engine] Spawning stream ingest worker...",
    "[16:54:11] [Worker-01] Stream PID 14092 created. Outputting RTMP to destinations...",
    "[16:54:12] [Monitor] Frame drop check: 0 frames dropped. Network Jitter: 4ms.",
    "[16:55:00] [Monitor] Frame drop check: 2 frames dropped. Bitrate: 4850 kbps."
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const appendLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const triggerNetworkInterrupt = async () => {
    setIsProcessing(true);
    setEngineState("failed");
    appendLog("[CRITICAL] RTMP Network drop detected! Ingest packets stalled.");
    
    // Step 1: Wait and go to retry
    await new Promise(r => setTimeout(r, 1200));
    setEngineState("retrying");
    setRetryCount(1);
    setBackoffDelay(2); // 2^1 seconds
    appendLog("[RETRY-ENGINE] Attempt 1: Calculating exponential backoff (2^1 = 2 seconds delay)...");
    
    await new Promise(r => setTimeout(r, 2000));
    appendLog("[RETRY-ENGINE] Dispatching connection probe to YouTube ingest server...");
    appendLog("[WARN] Ingest server unreachable. Network route timeout.");
    
    // Step 2: Retry 2
    setRetryCount(2);
    setBackoffDelay(4); // 2^2 seconds
    appendLog("[RETRY-ENGINE] Attempt 2: Calculating backoff (2^2 = 4 seconds delay)...");
    
    await new Promise(r => setTimeout(r, 3000)); // wait slightly shorter for UI speed
    appendLog("[RETRY-ENGINE] Probing network route. Latency: 180ms. Link active!");
    appendLog("[RETRY-ENGINE] Re-authorizing RTMP credentials...");
    
    await new Promise(r => setTimeout(r, 1000));
    setEngineState("recovered");
    setRetryCount(0);
    setBackoffDelay(0);
    appendLog("[RECOVERY] Stream source pipe recovered. Resuming FFmpeg frame push.");
    appendLog("[Monitor] Frame rate stabilized at 30fps. Bitrate: 4800 kbps.");
    setIsProcessing(false);
  };

  const triggerWorkerCrash = async () => {
    setIsProcessing(true);
    setEngineState("failed");
    appendLog("[CRITICAL] Container FFmpeg-worker-01 killed (SIGKILL). Process PID 14092 terminated.");
    
    // BullMQ and Redis orchestration simulation
    await new Promise(r => setTimeout(r, 1000));
    setEngineState("retrying");
    appendLog("[BullMQ] Job 'stream_process_usr_90123' set to retrying state. Redelivering queue ticket.");
    
    await new Promise(r => setTimeout(r, 1200));
    appendLog("[Orchestrator] Provisioning replacement pod: worker-node-02-pod.");
    appendLog("[Orchestrator] Pod status: RUNNING. Spawning FFmpeg PID 18902.");
    
    await new Promise(r => setTimeout(r, 800));
    setEngineState("recovered");
    appendLog("[RECOVERY] Worker node handoff completed. Ingest stream recovered successfully.");
    setIsProcessing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          Live Streaming Engine Testing
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Inject synthetic connection faults, kill encoding containers, and verify exponential backoff retry state machine.</p>
      </div>

      {/* State Graph and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: State Engine Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-secondary" />
              State Machine Visualizer & Failure Injector
            </h2>

            {/* Simulated state flow chart */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 bg-slate-950/20 rounded-2xl border border-[var(--border)/5] mb-8">
              <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                engineState === "streaming" 
                  ? "bg-success/15 text-success border-success glow-success" 
                  : "bg-white/5 border-[var(--border)] text-slate-500"
              }`}>
                1. STREAMING (OK)
              </div>
              <div className="hidden sm:block text-slate-600">→</div>
              
              <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                engineState === "failed" 
                  ? "bg-danger/15 text-danger border-danger glow-primary" 
                  : "bg-white/5 border-[var(--border)] text-slate-500"
              }`}>
                2. FAILED (FAULT)
              </div>
              <div className="hidden sm:block text-slate-600">→</div>

              <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                engineState === "retrying" 
                  ? "bg-warning/15 text-warning border-warning glow-primary animate-pulse" 
                  : "bg-white/5 border-[var(--border)] text-slate-500"
              }`}>
                3. RETRYING ({retryCount > 0 ? `Attempt ${retryCount}` : "WAIT"})
              </div>
              <div className="hidden sm:block text-slate-600">→</div>

              <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                engineState === "recovered" 
                  ? "bg-primary/15 text-primary border-primary glow-secondary" 
                  : "bg-white/5 border-[var(--border)] text-slate-500"
              }`}>
                4. RECOVERED
              </div>
            </div>

            {/* Backoff Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900/30 border border-[var(--border)]">
                <p className="text-xs text-slate-400 font-medium">Exponential Backoff Formula</p>
                <p className="text-lg font-bold text-white font-mono mt-1">Delay = min(2<sup>retry</sup>, 64)s</p>
                <p className="text-[10px] text-slate-500 mt-2">Protects ingestion nodes from request floods during recovery.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/30 border border-[var(--border)]">
                <p className="text-xs text-slate-400 font-medium">Active Backoff Countdown</p>
                <p className="text-xl font-bold text-warning font-mono mt-1">
                  {backoffDelay > 0 ? `${backoffDelay} seconds remaining` : "0 seconds (Idle)"}
                </p>
                <p className="text-[10px] text-slate-500 mt-2">Simulated timer representing client wait window.</p>
              </div>
            </div>

            {/* Control buttons */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fault Injection Controllers</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={triggerNetworkInterrupt}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-danger hover:bg-red-600 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-colors"
                >
                  <AlertOctagon className="w-4 h-4" /> Inject 15s Network Outage
                </button>
                <button
                  onClick={triggerWorkerCrash}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-bold text-xs shadow-lg disabled:opacity-50 transition-colors"
                >
                  <AlertOctagon className="w-4 h-4" /> Inject FFmpeg Worker Crash
                </button>
                <button
                  onClick={() => {
                    setEngineState("streaming");
                    setRetryCount(0);
                    setBackoffDelay(0);
                    setLogs([
                      "[16:54:10] [Engine] Spawning stream Ingest worker...",
                      "[16:54:11] [Worker-01] Stream PID 14092 created. Outputting RTMP to destinations...",
                      "[16:54:12] [Monitor] Frame drop check: 0 frames dropped. Network Jitter: 4ms."
                    ]);
                  }}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-[var(--border)] hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Reset Engine Simulator
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Ingest Console log output */}
        <div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col h-[500px] sticky top-24">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                FFmpeg Worker Ingest
              </h2>
              <span className="text-[10px] font-mono text-success">ONLINE</span>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 font-mono text-[10px] space-y-2 text-slate-300 border border-slate-800 leading-relaxed scrollbar-thin">
              {logs.map((log, index) => (
                <div key={index} className={
                  log.includes("[CRITICAL]") 
                    ? "text-danger font-semibold" 
                    : log.includes("[RECOVERY]") 
                      ? "text-success font-bold mt-1" 
                      : log.includes("[RETRY-ENGINE]") 
                        ? "text-warning" 
                        : "text-slate-300"
                }>
                  {log}
                </div>
              ))}
            </div>

            <button
              onClick={() => setLogs([])}
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-[var(--border)] transition-colors"
            >
              Clear Log Console
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
