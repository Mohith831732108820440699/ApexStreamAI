"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  FileSpreadsheet,
  Settings,
  Tv,
  KeyRound,
  CreditCard,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Bot
} from "lucide-react";

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "Security scan identified 3 potential vulnerabilities.",
    "FFmpeg worker-03 auto-recovered successfully.",
    "Billing test suite executed: All 12 assertions passed."
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const body = document.body;
    if (isDarkMode) {
      body.classList.remove("light-theme");
    } else {
      body.classList.add("light-theme");
    }
  }, [isDarkMode]);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Authentication Test", href: "/auth-testing", icon: KeyRound },
    { name: "Subscription & Billing", href: "/subscriptions-testing", icon: CreditCard },
    { name: "Channel Integrations", href: "/channels-testing", icon: Tv },
    { name: "Streaming Engine", href: "/streaming-testing", icon: Activity },
    { name: "AI Case Generator", href: "/ai-generator", icon: Bot },
    { name: "Security Scanner", href: "/security-scanner", icon: ShieldCheck },
    { name: "Performance Tester", href: "/load-tester", icon: Zap },
    { name: "Admin Dashboard", href: "/admin-panel", icon: Settings },
    { name: "System Reports", href: "/reports", icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar backdrop-blur-xl border-r border-[var(--border)] sticky top-0 h-screen z-20 shrink-0">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--border)] gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-lg shadow-md glow-primary">
            S
          </div>
          <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            StreamTest AI
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-secondary/10 border border-primary/30 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {item.name}
                {item.href === "/streaming-testing" && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-success glow-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions (User, Theme toggle) */}
        <div className="p-4 border-t border-[var(--border)] bg-slate-900/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-xs">
                JD
              </div>
              <div>
                <p className="text-xs font-semibold text-white">John Dev</p>
                <p className="text-[10px] text-slate-400">Enterprise QA</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="flex md:hidden items-center justify-between px-6 h-16 bg-sidebar/90 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-md">
            S
          </div>
          <span className="text-lg font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            StreamTest AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 max-w-xs h-full bg-sidebar flex flex-col border-r border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 flex items-center px-6 border-b border-[var(--border)] gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-md">
                S
              </div>
              <span className="text-md font-bold tracking-wider text-white">StreamTest AI</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? "bg-primary/20 border border-primary/30 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 text-slate-400" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-0">
        {/* Top Header - Desktop only */}
        <header className="hidden md:flex items-center justify-between px-8 h-16 border-b border-[var(--border)] bg-slate-900/5 backdrop-blur-md sticky top-0 z-10">
          <div className="text-sm text-slate-400">
            Platform Status: <span className="text-success font-semibold">Active & Healthy</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Drawer */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger glow-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl z-50">
                  <div className="p-4 border-b border-[var(--border)] bg-slate-950/20 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button 
                      onClick={() => setNotifications([])} 
                      className="text-xs text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No new alerts</div>
                    ) : (
                      notifications.map((note, index) => (
                        <div key={index} className="p-3.5 border-b border-[var(--border)/5] hover:bg-white/2 text-xs leading-relaxed text-slate-300">
                          {note}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-[var(--border)]" />

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-success glow-pulse mr-1" />
              <span className="text-xs font-semibold text-slate-300">RTMP/HLS Sandbox: Online</span>
            </div>
          </div>
        </header>

        {/* Page Children Render */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
