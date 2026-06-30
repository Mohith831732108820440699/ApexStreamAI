import { NextResponse } from "next/server";

export async function GET() {
  // Generate load testing series data
  const loadTestTiers = {
    "1k": [
      { timestamp: "0s", responseTime: 120, throughput: 950, errorRate: 0.00, cpu: 12, memory: 35 },
      { timestamp: "10s", responseTime: 125, throughput: 980, errorRate: 0.00, cpu: 14, memory: 35 },
      { timestamp: "20s", responseTime: 118, throughput: 1000, errorRate: 0.00, cpu: 15, memory: 36 },
      { timestamp: "30s", responseTime: 122, throughput: 990, errorRate: 0.02, cpu: 14, memory: 36 },
      { timestamp: "40s", responseTime: 120, throughput: 1005, errorRate: 0.00, cpu: 16, memory: 36 },
      { timestamp: "50s", responseTime: 121, throughput: 1010, errorRate: 0.00, cpu: 15, memory: 36 },
      { timestamp: "60s", responseTime: 123, throughput: 1000, errorRate: 0.00, cpu: 15, memory: 36 }
    ],
    "10k": [
      { timestamp: "0s", responseTime: 140, throughput: 8200, errorRate: 0.01, cpu: 32, memory: 48 },
      { timestamp: "10s", responseTime: 148, throughput: 9500, errorRate: 0.02, cpu: 38, memory: 49 },
      { timestamp: "20s", responseTime: 152, throughput: 9850, errorRate: 0.04, cpu: 41, memory: 51 },
      { timestamp: "30s", responseTime: 145, throughput: 9990, errorRate: 0.03, cpu: 42, memory: 52 },
      { timestamp: "40s", responseTime: 151, throughput: 10050, errorRate: 0.05, cpu: 44, memory: 52 },
      { timestamp: "50s", responseTime: 149, throughput: 10120, errorRate: 0.02, cpu: 43, memory: 52 },
      { timestamp: "60s", responseTime: 153, throughput: 10020, errorRate: 0.04, cpu: 42, memory: 52 }
    ],
    "50k": [
      { timestamp: "0s", responseTime: 210, throughput: 38000, errorRate: 0.12, cpu: 65, memory: 72 },
      { timestamp: "10s", responseTime: 235, throughput: 44200, errorRate: 0.18, cpu: 71, memory: 74 },
      { timestamp: "20s", responseTime: 258, throughput: 48500, errorRate: 0.25, cpu: 78, memory: 76 },
      { timestamp: "30s", responseTime: 270, throughput: 49800, errorRate: 0.32, cpu: 81, memory: 78 },
      { timestamp: "40s", responseTime: 262, throughput: 50100, errorRate: 0.28, cpu: 80, memory: 78 },
      { timestamp: "50s", responseTime: 285, throughput: 49500, errorRate: 0.41, cpu: 83, memory: 79 },
      { timestamp: "60s", responseTime: 290, throughput: 50050, errorRate: 0.38, cpu: 82, memory: 79 }
    ],
    "100k": [
      { timestamp: "0s", responseTime: 340, throughput: 78000, errorRate: 0.65, cpu: 88, memory: 86 },
      { timestamp: "10s", responseTime: 395, throughput: 89000, errorRate: 1.12, cpu: 91, memory: 88 },
      { timestamp: "20s", responseTime: 445, throughput: 95500, errorRate: 1.84, cpu: 94, memory: 89 },
      { timestamp: "30s", responseTime: 520, throughput: 98200, errorRate: 2.45, cpu: 96, memory: 91 },
      { timestamp: "40s", responseTime: 498, throughput: 99100, errorRate: 2.10, cpu: 95, memory: 91 },
      { timestamp: "50s", responseTime: 565, throughput: 97500, errorRate: 3.12, cpu: 97, memory: 92 },
      { timestamp: "60s", responseTime: 590, throughput: 98800, errorRate: 3.56, cpu: 98, memory: 93 }
    ]
  };

  return NextResponse.json({
    metrics: loadTestTiers,
    timestamp: new Date().toISOString(),
    summary: {
      tool: "k6",
      engine: "Distributed Kube-k6-Operator",
      vUs: [1000, 10000, 50000, 100000],
      runnerNodes: 8,
      status: "ready"
    }
  });
}
