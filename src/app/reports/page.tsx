"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, FileText, CheckCircle2, ShieldCheck, Zap, KeyRound } from "lucide-react";

interface ReportItem {
  id: string;
  name: string;
  type: "Security Audit" | "Performance Benchmark" | "E2E Auth Suite" | "Channel Handshake";
  date: string;
  status: "Passed" | "Warnings" | "Failed";
  downloadFileName: string;
  csvData: string;
}

export default function Reports() {
  const [reports] = useState<ReportItem[]>([
    {
      id: "REP-SEC-01",
      name: "Q2-2026 API OWASP Security Vulnerability Audit",
      type: "Security Audit",
      date: "2026-06-29 16:57:42",
      status: "Warnings",
      downloadFileName: "streamtest_security_audit_q2_2026.csv",
      csvData: "Vulnerability ID,Category,OWASP Code,Severity,Status,Remediation\n" +
               "vuln-01,Broken Object Level Authorization (BOLA),API1:2023,High,Open,Implement tenancy check\n" +
               "vuln-02,Cross-Site Scripting (Stored XSS),A03:2021-Injection,Medium,Open,Sanitize descriptions input\n" +
               "vuln-03,Rate Limit Missing,A04:2021-Design,Low,Open,Implement IP rate limiter\n"
    },
    {
      id: "REP-PERF-02",
      name: "100,000 Users Distributed k6 Load Test Report",
      type: "Performance Benchmark",
      date: "2026-06-29 16:55:12",
      status: "Passed",
      downloadFileName: "streamtest_k6_load_test_100k.csv",
      csvData: "Timestamp,Concurrent Users,Avg Response Time (ms),Throughput (req/s),Error Rate (%)\n" +
               "0s,100000,340,78000,0.65\n" +
               "10s,100000,395,89000,1.12\n" +
               "20s,100000,445,95500,1.84\n" +
               "30s,100000,520,98200,2.45\n" +
               "40s,100000,498,99100,2.10\n" +
               "50s,100000,565,97500,3.12\n" +
               "60s,100000,590,98800,3.56\n"
    },
    {
      id: "REP-AUTH-03",
      name: "Authentication & Lockout Policy E2E Log",
      type: "E2E Auth Suite",
      date: "2026-06-29 16:52:10",
      status: "Passed",
      downloadFileName: "streamtest_auth_e2e_results.csv",
      csvData: "Test Case ID,Assertion Checked,Result,Execution Time (ms)\n" +
               "TC-AUTH-S1,Email Validation format error,Passed,420\n" +
               "TC-AUTH-S1,Existing email duplicate constraint,Passed,310\n" +
               "TC-AUTH-L1,Lockout after 5 invalid attempts,Passed,890\n" +
               "TC-AUTH-G1,OAuth callback validation token,Passed,670\n"
    }
  ]);

  const handleDownloadCSV = (report: ReportItem) => {
    const blob = new Blob([report.csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", report.downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyle = (status: string) => {
    if (status === "Passed") return "bg-success/10 text-success border border-success/20";
    if (status === "Warnings") return "bg-warning/10 text-warning border border-warning/20";
    return "bg-danger/10 text-danger border border-danger/20";
  };

  const getTypeIcon = (type: string) => {
    if (type === "Security Audit") return <ShieldCheck className="w-5 h-5 text-danger" />;
    if (type === "Performance Benchmark") return <Zap className="w-5 h-5 text-primary" />;
    return <KeyRound className="w-5 h-5 text-secondary" />;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-primary" />
          System Reports Portal
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Export performance benchmarks, security audit metrics, and E2E test results directly to your local computer.</p>
      </div>

      {/* Reports Directory */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-secondary" />
            QA Reports Directory
          </h2>
          <span className="text-xs text-slate-400">Select format to export</span>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-2xl bg-slate-900/40 border border-[var(--border)] hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-[var(--border)/5] shrink-0">
                  {getTypeIcon(report.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{report.id}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">• {report.date}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-1.5 leading-snug">{report.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Type: {report.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getStatusStyle(report.status)}`}>
                  {report.status.toUpperCase()}
                </span>
                
                <button
                  onClick={() => handleDownloadCSV(report)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-all shadow-lg glow-primary"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                
                <button
                  onClick={() => alert(`Generating PDF layout for ${report.id}. Standard print stylesheet will open.`)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-[var(--border)] hover:bg-white/10 text-slate-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration details */}
      <div className="glass-panel p-6 rounded-2xl border-dashed bg-gradient-to-tr from-primary/5 to-transparent">
        <h3 className="text-sm font-bold text-slate-300 mb-2">Continuous Testing Automated Exports</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Integrate webhooks in your CI/CD pipeline to push these reports directly to Slack, Microsoft Teams, or email digests upon every release cycle. Check out our <span className="text-primary hover:underline cursor-pointer">CI/CD documentation</span> for code samples.
        </p>
      </div>
    </div>
  );
}
