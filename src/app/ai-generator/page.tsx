"use client";

import React, { useState } from "react";
import { Bot, Play, Sparkles, Code, FileCode, CheckCircle, HelpCircle, RefreshCw } from "lucide-react";

interface TestCase {
  id: string;
  title: string;
  severity: string;
  steps: string[];
  assertions: string[];
  edgeCase: string;
}

interface TestSuite {
  suiteName: string;
  testType: string;
  generatedAt: string;
  testCases: TestCase[];
}

export default function AITestCaseGenerator() {
  const [prompt, setPrompt] = useState("");
  const [testType, setTestType] = useState("functional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suite, setSuite] = useState<TestSuite | null>(null);

  const templates = [
    {
      title: "YouTube OAuth Integration",
      prompt: "Validate YouTube OAuth connection flow. Ensure refresh token is fetched and cached, and verifying that expired access tokens trigger automated token renewal without interrupting active RTMP broadcasts."
    },
    {
      title: "Stripe Webhook Upgrades",
      prompt: "Validate standard to premium subscription upgrades. Trigger stripe customer.subscription.updated webhook and assert channel limits raise from 1 to 3 in memory, and storage expands to 100GB."
    },
    {
      title: "Worker Failures & Auto-Recovery",
      prompt: "Inject worker failure during live encoding. Assert that primary worker crash (SIGKILL) trigger BullMQ retry scheduler to spin up secondary ffmpeg worker within 2.5 seconds, matching segments."
    }
  ];

  const handleGenerate = async (selectedPrompt?: string) => {
    const activePrompt = selectedPrompt || prompt;
    if (!activePrompt.trim()) return;

    setIsGenerating(true);
    setSuite(null);

    try {
      const res = await fetch("/api/ai-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: activePrompt, type: testType })
      });
      const data = await res.json();
      if (data.success) {
        setSuite(data);
      }
    } catch (e) {
      console.error("Error generating test suite:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          AI Test Case Generator
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Draft test cases, integration scenarios, regression specs, and critical edge cases using NLP prompt analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Input Prompt Specs (1/3 width) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Prompt Specifications
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Describe feature or API endpoint</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Test password reset flow with expired verification tokens..."
                className="w-full h-32 rounded-xl bg-slate-950/40 border border-[var(--border)] p-3 text-xs text-white focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Test Class Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-[var(--border)] p-3 text-xs text-white focus:outline-none focus:border-primary"
              >
                <option value="functional">Functional Validation</option>
                <option value="integration">API & Integration</option>
                <option value="security">Security Vulnerability Check</option>
                <option value="performance">Load & Scale Test</option>
                <option value="regression">Regression Suite</option>
              </select>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Specs...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Generate Test Suite
                </>
              )}
            </button>
          </div>

          {/* Quick templates */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example System Templates</h3>
            <div className="space-y-2.5">
              {templates.map(tpl => (
                <button
                  key={tpl.title}
                  onClick={() => {
                    setPrompt(tpl.prompt);
                    handleGenerate(tpl.prompt);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white/2 hover:bg-white/5 border border-[var(--border)] text-xs transition-colors group"
                >
                  <p className="font-bold text-white group-hover:text-primary transition-colors">{tpl.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{tpl.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Output (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {!suite && !isGenerating && (
            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-[var(--border)] flex items-center justify-center text-slate-400">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Awaiting Specifications</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Enter specifications or select a quick template to trigger AI-powered test case generation.</p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 h-full min-h-[400px]">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin flex items-center justify-center" />
              <div>
                <h3 className="font-bold text-white text-base">Generative Engine Running</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Parsing user story dependencies, mapping database rules, and formatting code assertions...</p>
              </div>
            </div>
          )}

          {suite && (
            <div className="space-y-6">
              {/* Meta banner */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-white">
                      {suite.testType}
                    </span>
                    <span className="text-[10px] text-slate-500">Generated: {new Date(suite.generatedAt).toLocaleTimeString()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5">{suite.suiteName}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 bg-white/5 border border-[var(--border)] text-slate-300 hover:text-white rounded-lg transition-colors">
                    <Code className="w-3.5 h-3.5" /> Export Jest Specs
                  </button>
                  <button className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 bg-white/5 border border-[var(--border)] text-slate-300 hover:text-white rounded-lg transition-colors">
                    <FileCode className="w-3.5 h-3.5" /> Playwright TS
                  </button>
                </div>
              </div>

              {/* Test Cases Grid */}
              <div className="space-y-6">
                {suite.testCases.map((tc, idx) => (
                  <div key={tc.id} className="glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        <span className="text-slate-500 text-xs font-mono">{tc.id}</span>
                        {tc.title}
                      </h3>
                      <span className="text-[10px] font-bold text-danger px-2.5 py-0.5 rounded bg-danger/10 border border-danger/20 uppercase">
                        {tc.severity} Severity
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Steps */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Steps</p>
                        <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                          {tc.steps.map((step, i) => (
                            <li key={i} className="leading-relaxed pl-1">{step}</li>
                          ))}
                        </ol>
                      </div>

                      {/* Assertions */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assertions</p>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {tc.assertions.map((assert, i) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                              <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                              <span>{assert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Edge Case Callout */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 text-xs leading-normal">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-primary">AI-Identified Critical Edge Case</p>
                        <p className="text-slate-300 mt-1">{tc.edgeCase}</p>
                      </div>
                    </div>
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
