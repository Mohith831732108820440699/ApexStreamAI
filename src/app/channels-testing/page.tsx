"use client";

import React, { useState } from "react";
import { Tv, ShieldCheck, Check, Play, RefreshCw, AlertCircle, RefreshCcw } from "lucide-react";

interface OAuthChannel {
  id: string;
  platform: "YouTube" | "Facebook";
  channelName: string;
  scopes: string[];
  status: "connected" | "expired" | "scope_missing";
  tokenLifeSeconds: number;
}

export default function ChannelsTesting() {
  const [channels, setChannels] = useState<OAuthChannel[]>([
    {
      id: "ch-yt-102",
      platform: "YouTube",
      channelName: "TechSolutions Broadcasters",
      scopes: ["youtube.force-ssl", "youtube.readonly", "userinfo.profile"],
      status: "connected",
      tokenLifeSeconds: 3590
    },
    {
      id: "ch-fb-204",
      platform: "Facebook",
      channelName: "TechSolutions Media Page",
      scopes: ["pages_manage_posts", "pages_read_engagement", "publish_video"],
      status: "scope_missing",
      scopesMissing: ["pages_show_list"],
      statusDetails: "Access token is valid, but missing 'pages_show_list' scope required to list pages."
    } as any,
    {
      id: "ch-yt-103",
      platform: "YouTube",
      channelName: "Gaming Zone Live Stream",
      scopes: ["youtube.force-ssl"],
      status: "expired",
      statusDetails: "OAuth Access Token expired at 2026-06-29T21:40:00Z."
    }
  ]);

  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [activeChannelName, setActiveChannelName] = useState<string>("");
  const [testingId, setTestingId] = useState<string | null>(null);

  const runChannelTest = async (channel: OAuthChannel, index: number) => {
    setTestingId(channel.id);
    setActiveChannelName(`${channel.platform} (${channel.channelName})`);
    setActiveLogs([`Initiating Integration Verification for ${channel.platform} channel...`]);

    const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

    await delay(300);
    setActiveLogs(prev => [...prev, `[OAuth] Checking client signature credentials...`]);
    await delay(300);
    setActiveLogs(prev => [...prev, `[OAuth] Verifying access token status: ${channel.status}...`]);

    if (channel.status === "expired") {
      setActiveLogs(prev => [...prev, `[WARN] Token expired. Triggering OAuth Refresh Token flow...`]);
      await delay(600);
      setActiveLogs(prev => [...prev, `[OAuth] Refreshing token using endpoint: oauth2.googleapis.com/token...`]);
      await delay(500);
      setActiveLogs(prev => [...prev, `[OAuth] New access token generated successfully. Valid for 3600 seconds.`]);
      
      // Update status in list
      setChannels(prev => {
        const next = [...prev];
        next[index].status = "connected";
        next[index].tokenLifeSeconds = 3600;
        return next;
      });
    } else if (channel.status === "scope_missing") {
      setActiveLogs(prev => [...prev, `[ERROR] Scope checks failed. Missing scope: pages_show_list`]);
      await delay(400);
      setActiveLogs(prev => [...prev, `[API] Attempting Page Retrieval query without scope...`]);
      await delay(300);
      setActiveLogs(prev => [...prev, `[API] Graph API response: HTTP 403 Forbidden (Code 200: Permissions error)`]);
      setActiveLogs(prev => [...prev, `RESULT: Integration Failed. Scopes must be refreshed by user.`]);
      setTestingId(null);
      return;
    }

    await delay(400);
    setActiveLogs(prev => [...prev, `[API] Generating scheduled live broadcast metadata payload...`]);
    await delay(400);
    
    if (channel.platform === "YouTube") {
      setActiveLogs(prev => [...prev, `[YouTube API] POST https://www.googleapis.com/youtube/v3/liveBroadcasts`]);
      await delay(300);
      setActiveLogs(prev => [...prev, `[YouTube API] Response: HTTP 201 Created | Broadcast ID: yt_live_901923`]);
      await delay(200);
      setActiveLogs(prev => [...prev, `[YouTube API] POST https://www.googleapis.com/youtube/v3/liveStreams`]);
      await delay(300);
      setActiveLogs(prev => [...prev, `[YouTube API] Response: RTMP Ingest URL: rtmp://a.rtmp.youtube.com/live2 | Stream Key: ****-****-****`]);
    } else {
      setActiveLogs(prev => [...prev, `[Facebook API] POST https://graph.facebook.com/v18.0/{page_id}/live_videos`]);
      await delay(500);
      setActiveLogs(prev => [...prev, `[Facebook API] Response: HTTP 200 OK | Video ID: fb_live_109283921 | Secure RTMP URL: rtmps://live-api-s.facebook.com:443/rtmp/...`]);
    }

    await delay(200);
    setActiveLogs(prev => [...prev, `RESULT: Social API handshake completed successfully! Integration verified.`]);
    setTestingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Tv className="w-8 h-8 text-primary" />
          Channel Integration Testing
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Validate OAuth token refresh loops, scopes alignment, live broadcast creations, and stream settings endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Channels */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-bold text-white">OAuth Integrations Registry</h2>
            <span className="text-xs text-slate-400">Sandbox Environment</span>
          </div>

          {channels.map((channel, idx) => (
            <div key={channel.id} className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${
                      channel.platform === "YouTube" ? "bg-red-600" : "bg-blue-600"
                    }`}>
                      {channel.platform}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{channel.id}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-2">{channel.channelName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                    channel.status === "connected"
                      ? "bg-success/10 text-success border border-success/20"
                      : channel.status === "expired"
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : "bg-danger/10 text-danger border border-danger/20"
                  }`}>
                    {channel.status === "connected" ? "CONNECTED" : channel.status === "expired" ? "EXPIRED" : "SCOPE ERROR"}
                  </span>
                  
                  <button
                    onClick={() => runChannelTest(channel, idx)}
                    disabled={testingId !== null}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50"
                  >
                    {channel.status === "expired" ? (
                      <>
                        <RefreshCcw className="w-3 h-3" /> Refresh & Test
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Verify Handshake
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scopes Section */}
              <div className="bg-slate-950/20 rounded-xl p-4 border border-[var(--border)/5] space-y-2 text-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Permission Scopes</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {channel.scopes.map(scope => (
                    <span key={scope} className="px-2.5 py-0.5 rounded bg-white/5 border border-[var(--border)] text-slate-300 font-mono text-[10px]">
                      {scope}
                    </span>
                  ))}
                  {channel.status === "scope_missing" && (channel as any).scopesMissing?.map((scope: string) => (
                    <span key={scope} className="px-2.5 py-0.5 rounded bg-danger/10 border border-danger/20 text-danger font-mono text-[10px]">
                      {scope} (Missing)
                    </span>
                  ))}
                </div>
                {channel.statusDetails && (
                  <p className="text-slate-400 text-xs mt-2 italic flex items-center gap-1.5 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />
                    {channel.statusDetails}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Future Channels Grid */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-300 mb-3">Integrations Under Development (Mock Environments Available)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {["Instagram Live", "Twitch API", "TikTok Live", "LinkedIn Live"].map(plat => (
                <div key={plat} className="p-3 rounded-xl bg-white/2 border border-[var(--border)] text-slate-400 text-center font-medium">
                  {plat}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: API handshake logs */}
        <div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col h-[500px] sticky top-24">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              API Handshake Verifier
            </h2>

            <div className="flex-1 overflow-y-auto bg-slate-950/80 rounded-xl p-4 font-mono text-[10px] space-y-2 text-slate-300 border border-slate-800 leading-relaxed scrollbar-thin">
              {activeLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-28">
                  <p>Trigger a handshake to verify API request payloads...</p>
                </div>
              ) : (
                <>
                  <div className="text-success font-semibold border-b border-white/5 pb-1 mb-2">
                    Running: {activeChannelName}
                  </div>
                  {activeLogs.map((log, index) => (
                    <div key={index} className={
                      log.startsWith("RESULT:") 
                        ? "text-success font-bold mt-2 pt-2 border-t border-white/5" 
                        : log.startsWith("[OAuth]") 
                          ? "text-primary" 
                          : log.startsWith("[ERROR]") || log.includes("Forbidden")
                            ? "text-danger" 
                            : log.startsWith("[WARN]") 
                              ? "text-warning" 
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
                  setActiveChannelName("");
                }}
                className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white rounded-xl border border-[var(--border)] transition-colors"
              >
                Clear Handshake Console
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
