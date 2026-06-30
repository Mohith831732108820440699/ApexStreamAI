"use client";

import React, { useState } from "react";
import { Settings, ShieldAlert, Users, CreditCard, Tag, TrendingUp, UserMinus, Plus, ShieldCheck } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "active" | "banned" | "trial_expired";
}

interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  status: "active" | "expired";
}

export default function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([
    { id: "usr-01", name: "David Miller", email: "david.m@streamcorp.io", plan: "Pro Plan", status: "active" },
    { id: "usr-02", name: "Sarah Jenkins", email: "s.jenkins@broadcasthub.com", plan: "Standard Plan", status: "active" },
    { id: "usr-03", name: "Alex Rover", email: "alex.rover@indiecast.tv", plan: "Free Trial", status: "trial_expired" },
    { id: "usr-04", name: "Bad Actor", email: "spammer_99@throwaway.com", plan: "Free Trial", status: "banned" }
  ]);

  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: "STREAM50", discountType: "percentage", value: 50, status: "active" },
    { code: "SAVE20USD", discountType: "fixed", value: 20, status: "active" }
  ]);

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"percentage" | "fixed">("percentage");
  const [newCouponVal, setNewCouponVal] = useState(15);

  const [alerts, setAlerts] = useState<string[]>([]);

  const triggerAlert = (msg: string) => {
    setAlerts(prev => [msg, ...prev].slice(0, 3));
  };

  const handleBanUser = (id: string, name: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const isBannedNow = u.status === "banned";
        const nextStatus = isBannedNow ? "active" : "banned";
        triggerAlert(`User '${name}' status updated to: ${nextStatus.toUpperCase()}`);
        return { ...u, status: nextStatus as any };
      }
      return u;
    }));
  };

  const handleExtendTrial = (name: string) => {
    triggerAlert(`Extended trial for '${name}' by 14 additional days. Status updated in subscription DB.`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    
    const newC: Coupon = {
      code: newCouponCode.toUpperCase().replace(/\s+/g, ""),
      discountType: newCouponType,
      value: newCouponVal,
      status: "active"
    };

    setCoupons(prev => [newC, ...prev]);
    triggerAlert(`Created coupon code: ${newC.code} (${newC.value}${newC.discountType === "percentage" ? "%" : " USD"} off)`);
    setNewCouponCode("");
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Admin Portal Testing
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Validate user access overrides, extend trials, create discount campaigns, and audit system logs.</p>
      </div>

      {/* Revenue metrics and Audit notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Operations (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Analytics Widget */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-secondary" />
              SaaS MRR Revenue Metrics
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-900/30 border border-[var(--border)]">
                <p className="text-xs text-slate-400 font-medium">Monthly Recur. (MRR)</p>
                <p className="text-2xl font-bold text-white mt-1.5">$48,250</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/30 border border-[var(--border)]">
                <p className="text-xs text-slate-400 font-medium">User Churn Rate</p>
                <p className="text-2xl font-bold text-white mt-1.5">1.8%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/30 border border-[var(--border)]">
                <p className="text-xs text-slate-400 font-medium">Avg Revenue (ARPU)</p>
                <p className="text-2xl font-bold text-white mt-1.5">$34.50</p>
              </div>
            </div>
          </div>

          {/* User management table */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-primary" />
              User Profiles Management
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-slate-400 font-medium">
                    <th className="pb-3.5 pl-2">User / Email</th>
                    <th className="pb-3.5">Active Plan</th>
                    <th className="pb-3.5">Status</th>
                    <th className="pb-3.5 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)/5]">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3.5 pl-2">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{user.email}</p>
                      </td>
                      <td className="py-3.5 text-slate-300 font-medium">{user.plan}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.status === "active"
                            ? "bg-success/10 text-success border border-success/20"
                            : user.status === "banned"
                              ? "bg-danger/10 text-danger border border-danger/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-2">
                        {user.status === "trial_expired" && (
                          <button
                            onClick={() => handleExtendTrial(user.name)}
                            className="px-2.5 py-1 rounded bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/20 transition-all font-bold text-[10px]"
                          >
                            Extend Trial
                          </button>
                        )}
                        <button
                          onClick={() => handleBanUser(user.id, user.name)}
                          className={`px-2.5 py-1 rounded transition-all font-bold text-[10px] ${
                            user.status === "banned"
                              ? "bg-success/15 hover:bg-success/25 text-success border border-success/20"
                              : "bg-danger/15 hover:bg-danger/25 text-danger border border-danger/20"
                          }`}
                        >
                          {user.status === "banned" ? "Unban" : "Ban User"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Coupon Creator & Live DB Hooks log (1/3 width) */}
        <div className="space-y-6">
          {/* Coupon Creator */}
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Tag className="w-4.5 h-4.5 text-warning" />
              Campaign Coupons Generator
            </h2>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Coupon Promo Code</label>
                <input
                  type="text"
                  placeholder="e.g. SUMMERSAVE30"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/40 border border-[var(--border)] p-3 text-xs text-white focus:outline-none focus:border-primary font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Type</label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-900 border border-[var(--border)] p-3 text-xs text-white focus:outline-none focus:border-primary"
                  >
                    <option value="percentage">Percent (%)</option>
                    <option value="fixed">Fixed (USD)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Discount Value</label>
                  <input
                    type="number"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-950/40 border border-[var(--border)] p-3 text-xs text-white focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!newCouponCode.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-xs shadow-lg glow-primary disabled:opacity-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </form>

            {/* Coupons List */}
            <div className="mt-6 border-t border-[var(--border)] pt-4 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Coupons Campaign</p>
              {coupons.map(c => (
                <div key={c.code} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950/20 border border-[var(--border)/5]">
                  <span className="font-mono font-bold text-white">{c.code}</span>
                  <span className="text-slate-400">
                    {c.value}{c.discountType === "percentage" ? "%" : " USD"} off
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Administrative Audit Logs Hook */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col h-[280px]">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-danger" />
              Database Hooks Audit
            </h2>

            <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 font-mono text-[9px] space-y-2 text-slate-300 border border-slate-800 leading-relaxed scrollbar-thin">
              {alerts.length === 0 ? (
                <div className="text-slate-500 text-center py-16">
                  <p>Awaiting administrative actions...</p>
                </div>
              ) : (
                alerts.map((msg, idx) => (
                  <div key={idx} className="text-slate-300 border-b border-white/5 pb-1.5 last:border-b-0">
                    <span className="text-primary font-bold">[{new Date().toLocaleTimeString()}] DB_HOOK:</span> {msg}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
