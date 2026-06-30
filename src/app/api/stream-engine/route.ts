import { NextResponse } from "next/server";

// Keep a simple mock state in-memory (this is a dev server mock)
let activeStreams = [
  {
    id: "str-90123",
    title: "Global Tech Summit Keynote 2026",
    video: "tech_keynote_final_1080p.mp4",
    channels: ["YouTube", "Facebook"],
    scheduledTime: "Live Now",
    status: "streaming",
    fps: 30,
    bitrate: 4850,
    resolution: "1080p",
    uptime: "02:14:15",
    frameDrops: 12,
    networkStatus: "stable",
    retryCount: 0
  },
  {
    id: "str-90124",
    title: "Product Launch: StreamTest AI Demo",
    video: "streamtest_launch.mp4",
    channels: ["YouTube", "Twitch"],
    scheduledTime: "Live Now",
    status: "streaming",
    fps: 29.97,
    bitrate: 5900,
    resolution: "1080p",
    uptime: "00:45:10",
    frameDrops: 4,
    networkStatus: "stable",
    retryCount: 0
  }
];

let streamEngineLogs = [
  "[16:54:10] [Engine] Initializing RTMP pipelines...",
  "[16:54:11] [Worker-01] Spawning FFmpeg process PID: 14092",
  "[16:54:12] [YouTube-Destination] Connecting to RTMP ingest: a.rtmp.youtube.com/live2...",
  "[16:54:13] [Facebook-Destination] Connecting to RTMP ingest: rtmp-api.facebook.com/live...",
  "[16:54:14] [Engine] HLS segmenter initialized. TS chunks generating successfully.",
  "[16:54:15] [Monitor] Uptime 00:00:01 | Bitrate 4800 kbps | 0 frame drops | Network: EXCELLENT",
  "[16:55:00] [Monitor] Uptime 00:00:46 | Bitrate 4850 kbps | 2 frame drops | Network: EXCELLENT"
];

let workerStatus = {
  cpuUsage: 42.5,
  ramUsage: 58.2,
  storageUsage: 31.8,
  redisQueue: 0,
  activeWorkers: 4,
  ffmpegProcesses: 2
};

export async function GET() {
  return NextResponse.json({
    streams: activeStreams,
    logs: streamEngineLogs,
    system: workerStatus,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, streamId } = body;

    const streamIndex = activeStreams.findIndex(s => s.id === streamId);

    if (action === "crash_worker") {
      workerStatus.cpuUsage = 98.9;
      workerStatus.activeWorkers = 3;
      workerStatus.ffmpegProcesses = 1;
      
      if (streamIndex !== -1) {
        activeStreams[streamIndex].status = "failed";
        activeStreams[streamIndex].networkStatus = "disconnected";
        activeStreams[streamIndex].bitrate = 0;
        activeStreams[streamIndex].fps = 0;
      }

      streamEngineLogs.push(`[${new Date().toLocaleTimeString()}] [CRITICAL] FFmpeg Worker Node 02 crashed unexpectedly! PID 14092 terminated.`);
      streamEngineLogs.push(`[${new Date().toLocaleTimeString()}] [WARN] Stream ${streamId || "str-90123"} has failed. Triggering Auto Recovery Engine.`);
      
      return NextResponse.json({ success: true, message: "Simulated worker crash triggered." });
    }

    if (action === "recover_worker") {
      workerStatus.cpuUsage = 40.1;
      workerStatus.activeWorkers = 4;
      workerStatus.ffmpegProcesses = 2;
      
      if (streamIndex !== -1) {
        activeStreams[streamIndex].status = "streaming";
        activeStreams[streamIndex].networkStatus = "stable";
        activeStreams[streamIndex].bitrate = 4750;
        activeStreams[streamIndex].fps = 30;
        activeStreams[streamIndex].retryCount += 1;
      }

      streamEngineLogs.push(`[${new Date().toLocaleTimeString()}] [RECOVERY] Spawning new replacement worker node. PID 18442.`);
      streamEngineLogs.push(`[${new Date().toLocaleTimeString()}] [RECOVERY] Re-connecting RTMP bindings to YouTube & Facebook.`);
      streamEngineLogs.push(`[${new Date().toLocaleTimeString()}] [RECOVERY] Stream ${streamId || "str-90123"} recovered successfully in 4.2 seconds.`);
      
      return NextResponse.json({ success: true, message: "Simulated recovery executed." });
    }

    if (action === "reset") {
      // Restore initial values
      activeStreams = [
        {
          id: "str-90123",
          title: "Global Tech Summit Keynote 2026",
          video: "tech_keynote_final_1080p.mp4",
          channels: ["YouTube", "Facebook"],
          scheduledTime: "Live Now",
          status: "streaming",
          fps: 30,
          bitrate: 4850,
          resolution: "1080p",
          uptime: "02:14:15",
          frameDrops: 12,
          networkStatus: "stable",
          retryCount: 0
        },
        {
          id: "str-90124",
          title: "Product Launch: StreamTest AI Demo",
          video: "streamtest_launch.mp4",
          channels: ["YouTube", "Twitch"],
          scheduledTime: "Live Now",
          status: "streaming",
          fps: 29.97,
          bitrate: 5900,
          resolution: "1080p",
          uptime: "00:45:10",
          frameDrops: 4,
          networkStatus: "stable",
          retryCount: 0
        }
      ];
      workerStatus = {
        cpuUsage: 42.5,
        ramUsage: 58.2,
        storageUsage: 31.8,
        redisQueue: 0,
        activeWorkers: 4,
        ffmpegProcesses: 2
      };
      streamEngineLogs = [
        "[16:54:10] [Engine] Initializing RTMP pipelines...",
        "[16:54:11] [Worker-01] Spawning FFmpeg process PID: 14092",
        "[16:54:12] [YouTube-Destination] Connecting to RTMP ingest: a.rtmp.youtube.com/live2...",
        "[16:54:13] [Facebook-Destination] Connecting to RTMP ingest: rtmp-api.facebook.com/live...",
        "[16:54:14] [Engine] HLS segmenter initialized. TS chunks generating successfully."
      ];
      return NextResponse.json({ success: true, message: "Engine simulator reset complete." });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
