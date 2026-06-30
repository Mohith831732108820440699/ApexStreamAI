"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Play, RefreshCw, Terminal, Search, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface Finding {
  id: string;
  category: string;
  owasp: string;
  severity: "high" | "medium" | "low";
  endpoint: string;
  description: string;
  evidence: string;
  remediation: string;
}

export default function SecurityScanner() {
  const [endpoint, setEndpoint] = useState("https://api.livestream-platform.example.com");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [riskScore, setRiskScore] = useState(3.4);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"findings" | "logs">("findings");

  const fetchScanState = async () => {
    try {
      const res = await fetch("/api/security-scan");
      const data = await res.json();
      setRiskScore(data.riskScore);
      setFindings(data.findings);
      if (!isScanning) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchScanState();
  }, []);

  const runSecurityScan = async () => {
    setIsScanning(true);
    setProgress(0);
    setActiveTab("logs");
    
    try {
      // Start scan
      await fetch("/api/security-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start_scan", endpoint })
      });

      // Fetch immediate logs
      const startRes = await fetch("/api/security-scan");
      const startData = await startRes.json();
      setLogs(startData.logs);

      // Simulate progress ticks
      let currentProgress = 0;
      const interval = setInterval(async () => {
        currentProgress += 20;
        
        await fetch("/api/security-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_progress", progressValue: currentProgress })
        });

        const stateRes = await fetch("/api/security-scan");
        const stateData = await stateRes.json();
        
        setProgress(currentProgress);
        setLogs(stateData.logs);

        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setRiskScore(stateData.riskScore);
          setFindings(stateData.findings);
          setActiveTab("findings");
        }
      }, 1000);

    } catch (e) {
      console.error(e);
      setIsScanning(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch("/api/security-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" })
      });
      fetchScanState();
      setProgress(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Security Testing Agent
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Scan API endpoints for OWASP Top 10 vulnerabilities, verify JWT token lifetimes, and audit file upload MIME restrictions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-[var(--border)] hover:bg-white/10 text-slate-300 transition-colors"
          >
            Reset Scanner
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-base font-bold text-white mb-4">Target API Configuration</h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              disabled={isScanning}
              className="w-full rounded-xl bg-slate-950/40 border border-[var(--border)] pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-primary font-mono"
            />
          </div>
          
          <button
            onClick={runSecurityScan}
            disabled={isScanning || !endpoint}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-danger hover:bg-red-600 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-colors shrink-0"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing ({progress}%)
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Vulnerability Audit
              </>
            )}
          </button>
        </div>

        {isScanning && (
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-6">
            <div 
              className="bg-danger h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Vulnerabilities & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Risk Score Widget (1/3 width) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Threat Risk Index</h2>
            
            {/* Circle progress representation */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  stroke={riskScore > 6 ? "#ef4444" : riskScore > 3 ? "#f59e0b" : "#22c55e"}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - riskScore / 10)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-extrabold text-white">{riskScore.toFixed(1)}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Out of 10</p>
              </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              riskScore > 6 
                ? "bg-danger/10 text-danger border border-danger/20" 
                : riskScore > 3 
                  ? "bg-warning/10 text-warning border border-warning/20" 
                  : "bg-success/10 text-success border border-success/20"
            }`}>
              {riskScore > 6 ? "CRITICAL THREAT RATING" : riskScore > 3 ? "MEDIUM RISK" : "SECURE"}
            </div>

            <div className="w-full grid grid-cols-3 gap-2 mt-8 text-center text-xs border-t border-[var(--border)] pt-6">
              <div>
                <p className="text-slate-400">High</p>
                <p className="font-bold text-danger mt-1">
                  {findings.filter(f => f.severity === "high").length}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Medium</p>
                <p className="font-bold text-warning mt-1">
                  {findings.filter(f => f.severity === "medium").length}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Low</p>
                <p className="font-bold text-success-hover mt-1">
                  {findings.filter(f => f.severity === "low").length}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Info card */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">MIME Upload Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated testing scripts intercept mock file uploads and scan for executable patterns (e.g. `.exe`, `.elf`, `.bat`) disguised as stream MP4 media assets.
            </p>
            <div className="flex items-center gap-2 text-xs text-success bg-success/5 border border-success/15 p-3 rounded-xl">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              Upload validation filter: ACTIVE
            </div>
          </div>
        </div>

        {/* Audit Details & Logs (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab("findings")}
              className={`px-6 py-3 text-xs font-bold transition-all relative ${
                activeTab === "findings" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Audits Findings ({findings.length})
              {activeTab === "findings" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-6 py-3 text-xs font-bold transition-all relative ${
                activeTab === "logs" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Scanner Logs
              {activeTab === "logs" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          </div>

          {activeTab === "findings" ? (
            <div className="space-y-6">
              {findings.map(finding => (
                <div key={finding.id} className="glass-panel p-6 rounded-2xl space-y-4 hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-slate-700 text-slate-300">
                          {finding.owasp}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{finding.id}</span>
                      </div>
                      <h3 className="font-bold text-white text-base mt-1.5">{finding.category}</h3>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase w-fit ${
                      finding.severity === "high"
                        ? "bg-danger/10 text-danger border border-danger/20"
                        : finding.severity === "medium"
                          ? "bg-warning/10 text-warning border border-warning/20"
                          : "bg-success/10 text-success border border-success/20"
                    }`}>
                      {finding.severity} Severity
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold">Vulnerable API Endpoint:</p>
                      <p className="font-mono text-white mt-1 bg-slate-950/40 p-2 rounded border border-[var(--border)] text-[10px] overflow-x-auto select-all">
                        {finding.endpoint}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-400 font-semibold">Description:</p>
                        <p className="text-slate-300 mt-1 leading-relaxed">{finding.description}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold">Evidence Captured:</p>
                        <p className="font-mono text-amber-400 mt-1 leading-relaxed bg-slate-950/20 p-2 rounded border border-[var(--border)/5] text-[10px]">
                          {finding.evidence}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex gap-2.5 leading-relaxed">
                      <AlertTriangle className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">Remediation Guide</p>
                        <p className="text-slate-300 mt-0.5">{finding.remediation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 font-mono text-[10px] space-y-2 text-slate-300 border border-slate-800 leading-relaxed scrollbar-thin">
                {logs.map((log, index) => (
                  <div key={index} className={
                    log.includes("Match found!") || log.includes("vulnerabilities identified")
                      ? "text-danger font-semibold"
                      : log.includes("Scan complete")
                        ? "text-success font-bold mt-2 border-t border-white/5 pt-2"
                        : "text-slate-300"
                  }>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
