"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, Phone, ChevronRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function AuthPortal() {
  const [activeTab, setActiveTab] = useState<"email" | "social" | "phone">("email");
  
  // Email Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone Form State
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [mockGeneratedOtp, setMockGeneratedOtp] = useState("");

  // Common UI State
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setAlert({ type: "error", msg: "OTP expired! Please click resend code." });
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      handleAlert("error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = { name: isSignUp ? name : email.split("@")[0], email, method: "Email/Password" };
      setLoggedInUser(user);
      handleAlert("success", `${isSignUp ? "Account created" : "Logged in"} successfully via Email!`);
    }, 1000);
  };

  const handleSocialLogin = (platform: "Google" | "GitHub") => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = {
        name: platform === "Google" ? "Mohith Google" : "Mohith831732108820440699",
        email: platform === "Google" ? "mohith.google@gmail.com" : "mohith.git@users.noreply.github.com",
        method: `${platform} OAuth`
      };
      setLoggedInUser(user);
      handleAlert("success", `Authenticated successfully via ${platform}!`);
    }, 1200);
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      handleAlert("error", "Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setMockGeneratedOtp(generated);
      setOtpSent(true);
      setTimer(120);
      handleAlert("success", `OTP sent successfully to ${phone}! (Demo code: ${generated})`);
    }, 1000);
  };

  const handleOtpChange = (element: any, index: number) => {
    if (isNaN(element.value)) return false;

    setOtpCode([...otpCode.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpCode.join("");
    if (enteredCode.length < 6) {
      handleAlert("error", "Please enter the complete 6-digit code.");
      return;
    }

    if (timer === 0) {
      handleAlert("error", "OTP has expired. Request a new one.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (enteredCode === mockGeneratedOtp) {
        const user = { name: "SMS User", email: phone, method: "Phone OTP" };
        setLoggedInUser(user);
        handleAlert("success", "Phone verified successfully!");
      } else {
        handleAlert("error", "Incorrect OTP code. Try again.");
      }
    }, 1000);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setOtpSent(false);
    setOtpCode(["", "", "", "", "", ""]);
    setEmail("");
    setPassword("");
    setPhone("");
    handleAlert("success", "Logged out successfully.");
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-fade-in-up py-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2.5">
          <Sparkles className="w-7 h-7 text-primary animate-pulse" />
          Interactive Auth Portal
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">Functional mock of our enterprise authentication gateways.</p>
      </div>

      {/* Alert display */}
      {alert && (
        <div className={`p-4 rounded-xl border flex items-start gap-2.5 text-xs ${
          alert.type === "success" 
            ? "bg-success/10 text-success border-success/20" 
            : "bg-danger/10 text-danger border-danger/20"
        }`}>
          {alert.type === "success" ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
          <span>{alert.msg}</span>
        </div>
      )}

      {loggedInUser ? (
        /* Logged In View */
        <div className="glass-panel p-8 rounded-3xl border border-[var(--border)] text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg glow-primary">
            {loggedInUser.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Welcome, {loggedInUser.name}!</h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">{loggedInUser.email}</p>
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              Authenticated via {loggedInUser.method}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white rounded-xl border border-[var(--border)] transition-colors"
          >
            Sign Out
          </button>
        </div>
      ) : (
        /* Form Login View */
        <div className="glass-panel rounded-3xl border border-[var(--border)] overflow-hidden shadow-2xl">
          {/* Tabs header */}
          <div className="flex border-b border-[var(--border)] bg-slate-900/10">
            <button
              onClick={() => { setActiveTab("email"); setAlert(null); }}
              className={`flex-1 py-3.5 text-xs font-bold transition-all relative ${activeTab === "email" ? "text-white bg-white/2" : "text-slate-400 hover:text-slate-200"}`}
            >
              Email/Pass
              {activeTab === "email" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
            </button>
            <button
              onClick={() => { setActiveTab("social"); setAlert(null); }}
              className={`flex-1 py-3.5 text-xs font-bold transition-all relative ${activeTab === "social" ? "text-white bg-white/2" : "text-slate-400 hover:text-slate-200"}`}
            >
              Google/Github
              {activeTab === "social" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
            </button>
            <button
              onClick={() => { setActiveTab("phone"); setAlert(null); }}
              className={`flex-1 py-3.5 text-xs font-bold transition-all relative ${activeTab === "phone" ? "text-white bg-white/2" : "text-slate-400 hover:text-slate-200"}`}
            >
              SMS OTP
              {activeTab === "phone" && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
            </button>
          </div>

          <div className="p-6">
            {/* Tab 1: Email Form */}
            {activeTab === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl bg-slate-950/40 border border-[var(--border)] pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/40 border border-[var(--border)] pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/40 border border-[var(--border)] pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-all mt-6"
                >
                  {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setAlert(null); }}
                    className="text-[11px] text-slate-400 hover:text-primary hover:underline"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "New to StreamTest AI? Create Account"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Social Login */}
            {activeTab === "social" && (
              <div className="space-y-3.5 py-4">
                {/* Google Button */}
                <button
                  onClick={() => handleSocialLogin("Google")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/2 hover:bg-white/5 border border-[var(--border)] hover:border-slate-600 transition-all font-semibold text-xs text-slate-300 hover:text-white"
                >
                  <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.527a5.99 5.99 0 0 1 5.99-5.99c1.624 0 3.098.648 4.204 1.702l3.14-3.14C19.127 3.036 16.29 1.5 12.24 1.5c-6.075 0-11 4.925-11 11s4.925 11 11 11c5.99 0 10.284-4.204 10.284-10.284a10.8 10.8 0 0 0-.284-2.93H12.24Z"
                    />
                  </svg>
                  Continue with Google OAuth
                </button>

                {/* GitHub Button */}
                <button
                  onClick={() => handleSocialLogin("GitHub")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#24292F] hover:bg-[#24292F]/90 transition-all font-semibold text-xs text-white shadow-md hover:shadow-lg"
                >
                  <svg className="w-4.5 h-4.5 mr-1 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2Z"
                    />
                  </svg>
                  Continue with GitHub OAuth
                </button>
              </div>
            )}

            {/* Tab 3: Phone SMS OTP */}
            {activeTab === "phone" && (
              <div className="space-y-4">
                {!otpSent ? (
                  /* Phone Entry Form */
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400">Mobile Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          placeholder="+91 99999 99999"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl bg-slate-950/40 border border-[var(--border)] pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !phone}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-all mt-6"
                    >
                      {loading ? "Sending..." : "Request SMS OTP Code"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  /* Code Entry Form */
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <div className="text-center space-y-1.5 mb-2">
                      <p className="text-xs text-slate-400">Enter the 6-digit verification code sent to</p>
                      <p className="text-xs font-bold text-white font-mono">{phone}</p>
                    </div>

                    {/* Numeric code cells */}
                    <div className="flex justify-between gap-2.5 max-w-xs mx-auto">
                      {otpCode.map((data, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={data}
                          onChange={(e) => handleOtpChange(e.target, index)}
                          onFocus={(e) => e.target.select()}
                          className="w-10 h-12 rounded-xl bg-slate-950/60 border border-[var(--border)] text-center text-lg text-white font-extrabold focus:outline-none focus:border-primary font-mono shadow-md"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpCode.join("").length < 6}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-all mt-4"
                    >
                      {loading ? "Verifying..." : "Verify Code"}
                    </button>

                    <div className="text-center text-xs mt-4">
                      {timer > 0 ? (
                        <span className="text-slate-500">Resend code in {timer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          className="text-primary font-semibold hover:underline"
                        >
                          Resend SMS OTP Code
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
