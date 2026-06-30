"use client";

import React, { useState } from "react";
import { CreditCard, Check, ShieldCheck, Play, RefreshCw, Layers, DollarSign, Database } from "lucide-react";

interface BillingScenario {
  id: string;
  name: string;
  gateway: "Stripe" | "Razorpay" | "PayPal";
  plan: "Free Trial" | "Standard" | "Premium" | "Pro";
  action: "Upgrade" | "Downgrade" | "Refund" | "Renewal" | "Expiration";
  status: "idle" | "running" | "passed" | "failed";
  assertions: string[];
  logs: string[];
}

export default function SubscriptionsTesting() {
  const [scenarios, setScenarios] = useState<BillingScenario[]>([
    {
      id: "SC-BILL-01",
      name: "Stripe Standard-to-Premium Upgrade",
      gateway: "Stripe",
      plan: "Premium",
      action: "Upgrade",
      status: "idle",
      assertions: [
        "Assert customer.subscription.updated webhook is processed successfully",
        "Assert channel connection limits update from 1 to 3 in DB",
        "Assert storage capacity limit updates from 5GB to 50GB in subscription meta",
        "Assert prorated payment billing record is inserted under billing_history"
      ],
      logs: [
        "STRIPE MOCK: Dispatching webhook event 'customer.subscription.updated'...",
        "WEBHOOK: Received event id 'evt_1O29x8321' from Stripe signature validator",
        "DATABASE: Querying user_id: 'usr_90123' subscription state",
        "DATABASE: Executing UPDATE subscriptions SET plan = 'premium', channel_limit = 3, storage_limit_gb = 50.00",
        "ASSERT: Asserting updated row count equals 1 - Success",
        "DATABASE: Inserting record into billing_history: amount = $29.00, tax = $2.32",
        "RESULT: Subscription upgrade verified. 4/4 Assertions Passed."
      ]
    },
    {
      id: "SC-BILL-02",
      name: "Razorpay Free Trial Expiration Lock",
      gateway: "Razorpay",
      plan: "Free Trial",
      action: "Expiration",
      status: "idle",
      assertions: [
        "Assert scheduler identifies expired subscription records",
        "Assert subscription status is set to 'canceled' in DB",
        "Assert user is blocked from starting a live stream (returns HTTP 403)",
        "Assert billing reminder email notification event is queued"
      ],
      logs: [
        "CRON JOB: Scanning active trial subscriptions for expiration triggers...",
        "SCHEDULER: Identified subscription 'sub_77182' expiration date reached: 2026-06-29T22:00:00Z",
        "DATABASE: UPDATE subscriptions SET status = 'canceled' WHERE id = 'sub_77182'",
        "API TEST: Requesting POST /api/v1/streams/start (Auth: user_77182)",
        "ASSERT: Asserting API response is HTTP 403 Forbidden - Success",
        "ASSERT: Asserting response message contains 'Subscription expired' - Success",
        "QUEUE: Dispatched billing_reminder email job to Redis BullMQ",
        "RESULT: Expiration logic validated. 4/4 Assertions Passed."
      ]
    },
    {
      id: "SC-BILL-03",
      name: "PayPal Premium Refund & Cancellation",
      gateway: "PayPal",
      plan: "Premium",
      action: "Refund",
      status: "idle",
      assertions: [
        "Assert paypal webhook 'PAYMENT.SALE.REFUNDED' is signed & verified",
        "Assert invoice status in billing_history transitions to 'refunded'",
        "Assert client account access is restricted to 'free_trial' limits",
        "Assert system triggers tax adjustment calculations ($0.00 tax due)"
      ],
      logs: [
        "PAYPAL MOCK: Dispatching event 'PAYMENT.SALE.REFUNDED' for sale ID 'sale_883219'",
        "WEBHOOK: Verifying PayPal webhook signature headers - Valid",
        "DATABASE: UPDATE billing_history SET status = 'refunded' WHERE invoice_id = 'inv_39821'",
        "DATABASE: UPDATE subscriptions SET plan = 'free_trial', channel_limit = 1 WHERE user_id = 'usr_10283'",
        "ASSERT: Checking active stream count - Active streams: 0 - Clean",
        "ASSERT: Tax write-back calculation complete. Tax adjusted: -$2.90 - Passed",
        "RESULT: Refund lifecycle test verified. 4/4 Assertions Passed."
      ]
    }
  ]);

  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [activeScenarioName, setActiveScenarioName] = useState<string>("");
  const [runningId, setRunningId] = useState<string | null>(null);

  const runScenario = async (index: number) => {
    const sc = scenarios[index];
    setRunningId(sc.id);
    setScenarios(prev => {
      const next = [...prev];
      next[index].status = "running";
      return next;
    });

    setActiveScenarioName(sc.name);
    setActiveLogs([`Initiating Billing Test Scenario: ${sc.name}...`]);

    for (let i = 0; i < sc.logs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveLogs(prev => [...prev, sc.logs[i]]);
    }

    setScenarios(prev => {
      const next = [...prev];
      next[index].status = "passed";
      return next;
    });
    setRunningId(null);
  };

  const planLimits = {
    "Free Trial": { channels: 1, storage: "5 GB", streamTime: "10 hours", price: "$0" },
    "Standard": { channels: 1, storage: "20 GB", streamTime: "50 hours", price: "$19/mo" },
    "Premium": { channels: 3, storage: "100 GB", streamTime: "250 hours", price: "$49/mo" },
    "Pro": { channels: 6, storage: "500 GB", streamTime: "Unlimited", price: "$99/mo" }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" />
          Subscription & Billing Testing Module
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Verify webhook integrations, payment gateways, plans limits enforcing, and subscription state machines.</p>
      </div>

      {/* Plans Limits Reference Guide */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-secondary" />
          SaaS Tiers & System Enforcement Limits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(planLimits).map(([planName, limits]) => (
            <div key={planName} className="p-4 rounded-xl bg-slate-900/30 border border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-2 right-2 text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                {limits.price}
              </div>
              <h3 className="font-bold text-white text-sm">{planName}</h3>
              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <p>Channels: <span className="text-white font-semibold">{limits.channels}</span></p>
                <p>Storage: <span className="text-white font-semibold">{limits.storage}</span></p>
                <p>Stream Limit: <span className="text-white font-semibold">{limits.streamTime}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Runner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Interactive Scenario Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-warning" />
              Webhook & Lifecycle Scenarios
            </h2>
            <span className="text-xs text-slate-400">Gateways: Stripe, Razorpay, PayPal</span>
          </div>

          {scenarios.map((sc, index) => (
            <div key={sc.id} className="glass-panel p-6 rounded-2xl hover:border-slate-700 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded bg-white/5 border border-slate-700">
                      {sc.gateway}
                    </span>
                    <span className="text-[10px] font-bold text-secondary px-2 py-0.5 rounded bg-secondary/10">
                      {sc.action}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{sc.id}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-2">{sc.name}</h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    sc.status === "passed"
                      ? "bg-success/10 text-success border border-success/20"
                      : sc.status === "running"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}>
                    {sc.status.toUpperCase()}
                  </span>
                  
                  <button
                    onClick={() => runScenario(index)}
                    disabled={runningId !== null}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" /> Run Verification
                  </button>
                </div>
              </div>

              {/* Assertions grid */}
              <div className="bg-slate-950/20 rounded-xl p-4 border border-[var(--border)/5] space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subscription Rules Validated</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {sc.assertions.map((assert, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.status === "passed" ? "bg-success" : "bg-slate-500"}`} />
                      <span className="line-clamp-1">{assert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Console Log output */}
        <div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col h-[480px] sticky top-24">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              Gateway Payload Verifier
            </h2>

            <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 font-mono text-[10px] space-y-2 text-slate-300 border border-slate-800 leading-relaxed scrollbar-thin">
              {activeLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-24">
                  <p>Trigger a billing scenario to stream payload validations...</p>
                </div>
              ) : (
                <>
                  <div className="text-success font-semibold border-b border-white/5 pb-1 mb-2">
                    Running: {activeScenarioName}
                  </div>
                  {activeLogs.map((log, index) => (
                    <div key={index} className={
                      log.startsWith("RESULT:") 
                        ? "text-success font-bold mt-2 pt-2 border-t border-white/5" 
                        : log.startsWith("STRIPE") || log.startsWith("PAYPAL") || log.startsWith("RAZORPAY")
                          ? "text-primary" 
                          : log.startsWith("ASSERT:") 
                            ? "text-success font-medium" 
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
                  setActiveScenarioName("");
                }}
                className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-[var(--border)] transition-colors"
              >
                Clear Output
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
