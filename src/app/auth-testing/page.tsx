"use client";

import React, { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle, XCircle, Play, RefreshCw, Terminal, Plus } from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  category: "Signup" | "Login" | "Google OAuth" | "GitHub OAuth" | "Forgot Password" | "Email Verification" | "Phone OTP";
  assertionsCount: number;
  status: "idle" | "running" | "passed" | "failed";
  playwrightLogs: string[];
  assertions: string[];
}

export default function AuthTesting() {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "TC-AUTH-S1",
      name: "User Sign Up & Form Validation Tests",
      category: "Signup",
      assertionsCount: 6,
      status: "idle",
      assertions: [
        "Assert validation error on invalid email formatting",
        "Assert warning message when email is already taken",
        "Assert strength meter block on short/weak passwords",
        "Assert database persistence for valid registrations",
        "Assert verification email dispatch payload matches schema",
        "Assert redirection to onboarding page post-registration"
      ],
      playwrightLogs: [
        "PLAYWRIGHT: Navigating to https://streamtest-saas.example.com/signup",
        "PLAYWRIGHT: Fuzzing email input with values: '', 'plainaddress', '@missing-domain.com'",
        "PLAYWRIGHT: Asserting validation messages are visible",
        "PLAYWRIGHT: Inserting existing user email 'existing_user@streamtest.ai'",
        "PLAYWRIGHT: Asserting server returns HTTP 409 Conflict",
        "PLAYWRIGHT: Typing password '123' and asserting 'Password too weak' banner",
        "PLAYWRIGHT: Completing valid signup form and verifying HTTP 201 Created response",
        "TEST: Verify email webhook capture and token structure matches database",
        "RESULT: 6/6 Assertions Passed. Test Passed."
      ]
    },
    {
      id: "TC-AUTH-L1",
      name: "Sign In Security & Lockout Tests",
      category: "Login",
      assertionsCount: 5,
      status: "idle",
      assertions: [
        "Assert login success with valid credentials & JWT generation",
        "Assert authorization error with incorrect password",
        "Assert lockout activation after exactly 5 failed login attempts",
        "Assert session cookie matches security flags (HttpOnly, Secure, SameSite)",
        "Assert session termination on logout command"
      ],
      playwrightLogs: [
        "PLAYWRIGHT: Navigating to https://streamtest-saas.example.com/login",
        "PLAYWRIGHT: Typing valid credentials and clicking Submit",
        "PLAYWRIGHT: Asserting JWT Cookie exists and is configured HttpOnly/Secure",
        "PLAYWRIGHT: Running brute-force simulation (5 invalid attempts with same email)",
        "PLAYWRIGHT: Asserting login endpoint responds with HTTP 423 Locked Out",
        "PLAYWRIGHT: Verification of account lockout release timer triggers in DB",
        "RESULT: 5/5 Assertions Passed. Test Passed."
      ]
    },
    {
      id: "TC-AUTH-G1",
      name: "Google OAuth 2.0 Integration Tests",
      category: "Google OAuth",
      assertionsCount: 4,
      status: "idle",
      assertions: [
        "Assert callback handles successful authentication correctly",
        "Assert login failure handles cancelled consent accurately",
        "Assert JWT payload parses user profile (email, name, picture)",
        "Assert automated access token refresh cycle works"
      ],
      playwrightLogs: [
        "PLAYWRIGHT: Simulating click on 'Sign in with Google' button",
        "PLAYWRIGHT: Intercepting OAuth callback redirect: code=4/0AX4X...&state=secure_state",
        "PLAYWRIGHT: Mocking Google Identity Platform exchange endpoint returning profile data",
        "PLAYWRIGHT: Asserting application database creates record for new user",
        "PLAYWRIGHT: Verifying application JWT session creation",
        "RESULT: 4/4 Assertions Passed. Test Passed."
      ]
    },
    {
      id: "TC-AUTH-GH1",
      name: "GitHub OAuth Integration Tests",
      category: "GitHub OAuth",
      assertionsCount: 4,
      status: "idle",
      assertions: [
        "Assert callback exchanges auth code for access token successfully",
        "Assert state parameter is verified against CSRF attacks",
        "Assert email is fetched from GitHub secondary private emails API",
        "Assert user profile data maps correctly to user record in database"
      ],
      playwrightLogs: [
        "PLAYWRIGHT: Simulating click on 'Sign in with GitHub' button",
        "PLAYWRIGHT: Intercepting callback redirect: code=git_code_8831&state=github_csrf_state",
        "PLAYWRIGHT: Exchanging auth code for access token at github.com/login/oauth/access_token",
        "PLAYWRIGHT: Fetching private emails from api.github.com/user/emails - Success",
        "TEST: Verifying state parameter match - Passed",
        "DATABASE: Merging GitHub profile (Mohith831732108820440699) with users registry",
        "RESULT: 4/4 Assertions Passed. Test Passed."
      ]
    },
    {
      id: "TC-AUTH-OTP1",
      name: "Phone Number OTP SMS Verification Tests",
      category: "Phone OTP",
      assertionsCount: 5,
      status: "idle",
      assertions: [
        "Assert SMS payload complies with Twilio gateway schemas",
        "Assert secure 6-digit OTP code is generated and stored in Redis cache",
        "Assert OTP rate limiting triggers on exceeding 3 resend commands",
        "Assert verification state sets to active on correct 6-digit match",
        "Assert verification blocks expired OTP codes (after 120s limit)"
      ],
      playwrightLogs: [
        "PLAYWRIGHT: Entering phone number '+91 8317321088' and clicking Request OTP",
        "TEST: Verify Twilio SMS API webhook trigger - Success",
        "REDIS: Set temporary OTP code key with TTL 120s: val='482910'",
        "PLAYWRIGHT: Typing incorrect OTP code '111111' and asserting error modal",
        "PLAYWRIGHT: Triggering resend SMS 3 times and verifying 429 rate limit blocker",
        "PLAYWRIGHT: Typing correct OTP code '482910' and checking DB verification state",
        "RESULT: 5/5 Assertions Passed. Test Passed."
      ]
    },
    {
      id: "TC-AUTH-P1",
      name: "Forgot Password Recovery Boundary Tests",
      category: "Forgot Password",
      assertionsCount: 4,
      status: "idle",
      assertions: [
        "Assert reset link mail payload contains valid cryptographically signed token",
        "Assert error message on expired password reset link (after 1 hour)",
        "Assert invalid / tampered token results in HTTP 400 Bad Request",
        "Assert database password hash changes successfully after recovery completion"
      ],
      playwrightLogs: [
        "PLAYWRIGHT: Navigating to /forgot-password",
        "PLAYWRIGHT: Triggering password reset request for 'qa_tester@streamtest.ai'",
        "TEST: Inspecting mock SMTP server and retrieving signed token: 'pwd_tok_102938'",
        "PLAYWRIGHT: Fuzzing password reset callback page with expired token",
        "PLAYWRIGHT: Asserting 'Link expired' modal displays correctly",
        "PLAYWRIGHT: Completing reset flow with valid token and logging in with new credentials",
        "RESULT: 4/4 Assertions Passed. Test Passed."
      ]
    }
  ]);

  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [activeTestName, setActiveTestName] = useState<string>("");
  const [runningAll, setRunningAll] = useState(false);

  const runTestCase = async (index: number) => {
    // Set to running
    setTestCases(prev => {
      const next = [...prev];
      next[index].status = "running";
      return next;
    });

    setActiveTestName(testCases[index].name);
    setActiveLogs([`Starting test case: ${testCases[index].name}...`]);

    const logs = testCases[index].playwrightLogs;
    for (let i = 0; i < logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveLogs(prev => [...prev, logs[i]]);
    }

    setTestCases(prev => {
      const next = [...prev];
      next[index].status = "passed";
      return next;
    });
  };

  const runAllTests = async () => {
    setRunningAll(true);
    // Reset all states
    setTestCases(prev => prev.map(t => ({ ...t, status: "idle" })));

    for (let i = 0; i < testCases.length; i++) {
      await runTestCase(i);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    setRunningAll(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <KeyRound className="w-8 h-8 text-primary" />
            Authentication Testing Module
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Verify credentials validation, security locks, email hooks, and OAuth callbacks.</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={runningAll}
          className="flex items-center justify-center px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white transition-all shadow-lg glow-primary gap-2 text-sm"
        >
          {runningAll ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running Suite...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Full Auth Suite
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Test Cases (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {testCases.map((tc, index) => (
            <div key={tc.id} className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-slate-700 text-slate-300">
                      {tc.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{tc.id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5">{tc.name}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    tc.status === "passed"
                      ? "bg-success/10 text-success border border-success/20"
                      : tc.status === "failed"
                        ? "bg-danger/10 text-danger border border-danger/20"
                        : tc.status === "running"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-white/5 text-slate-400 border border-[var(--border)]"
                  }`}>
                    {tc.status.toUpperCase()}
                  </span>
                  
                  <button
                    onClick={() => runTestCase(index)}
                    disabled={tc.status === "running" || runningAll}
                    className="p-2 rounded-lg bg-white/5 border border-[var(--border)] hover:bg-primary/20 hover:border-primary hover:text-white text-slate-300 transition-all"
                    title="Run individual test"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Assertions list */}
              <div className="bg-slate-950/20 rounded-xl p-4 border border-[var(--border)/5]">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">E2E Playwright Assertions</h3>
                <ul className="space-y-2 text-xs">
                  {tc.assertions.map((assert, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-slate-300 leading-normal">
                      {tc.status === "passed" ? (
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      ) : tc.status === "failed" ? (
                        <XCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-2 ml-1" />
                      )}
                      <span>{assert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Future Section placeholder */}
          <div className="glass-panel p-6 rounded-2xl border-dashed flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-300">Future Security Integrations</p>
                <p className="text-xs text-slate-500">2FA Authenticator & WebAuthn/Passkeys test runners.</p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-white/5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Configure
            </button>
          </div>
        </div>

        {/* Right Column: Execution Log Console (1/3 width) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl sticky top-24 flex flex-col h-[500px]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Live Assertions terminal
              </h2>
              <span className="text-[10px] font-mono text-slate-500">Playwright 1.40</span>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 font-mono text-[10px] space-y-2 text-slate-300 border border-slate-800 leading-relaxed scrollbar-thin">
              {activeLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-20">
                  <p>Click "Run" to stream E2E test logs...</p>
                </div>
              ) : (
                <>
                  <div className="text-primary font-semibold border-b border-white/5 pb-1 mb-2">
                    Executing: {activeTestName}
                  </div>
                  {activeLogs.map((log, index) => (
                    <div key={index} className={
                      log.startsWith("RESULT:") 
                        ? "text-success font-semibold mt-1 border-t border-white/5 pt-1" 
                        : log.startsWith("TEST:") 
                          ? "text-secondary" 
                          : "text-slate-300"
                    }>
                      {log}
                    </div>
                  ))}
                </>
              )}
            </div>

            {activeLogs.length > 0 && (
              <button
                onClick={() => {
                  setActiveLogs([]);
                  setActiveTestName("");
                }}
                className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-[var(--border)] transition-colors"
              >
                Clear Terminal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
