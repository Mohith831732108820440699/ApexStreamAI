import { NextResponse } from "next/server";

let scanState = {
  isScanning: false,
  progress: 0,
  targetEndpoint: "https://api.livestream-platform.example.com",
  riskScore: 3.4, // out of 10
  findings: [
    {
      id: "vuln-01",
      category: "Broken Object Level Authorization (BOLA)",
      owasp: "API1:2023",
      severity: "high",
      endpoint: "/api/v1/channels/{channelId}/billing",
      description: "Endpoint allows standard users to read billing structures of other channels by modifying the channelId parameter in the request URI.",
      evidence: "HTTP 200 returned for unauthorized channel ID query",
      remediation: "Implement strict tenancy checking on resource ownership in the backend access handler."
    },
    {
      id: "vuln-02",
      category: "Cross-Site Scripting (Stored XSS)",
      owasp: "A03:2021-Injection",
      severity: "medium",
      endpoint: "/api/v1/streams/metadata",
      description: "The stream description input does not sanitize HTML tags before database persistence, which renders in the public HLS player page layout.",
      evidence: "Injected payload <script>alert(1)</script> was stored and rendered",
      remediation: "Sanitize all incoming string input payloads using DOMPurify or equivalent backend library."
    },
    {
      id: "vuln-03",
      category: "Rate Limit Missing (Broken Authenticated API)",
      owasp: "A04:2021-Design",
      severity: "low",
      endpoint: "/api/v1/auth/forgot-password",
      description: "No rate limit is enforced on password reset mail trigger endpoint, allowing mass mail spamming and potential server fatigue.",
      evidence: "Sent 500 requests in 10 seconds; all returned HTTP 200 Success",
      remediation: "Implement IP and User-based rate limiting on sensitive transactional endpoints."
    }
  ],
  logs: [
    "Scan ready. Awaiting trigger..."
  ]
};

export async function GET() {
  return NextResponse.json(scanState);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, endpoint } = body;

    if (action === "start_scan") {
      scanState.isScanning = true;
      scanState.progress = 0;
      scanState.targetEndpoint = endpoint || scanState.targetEndpoint;
      scanState.logs = [
        `[${new Date().toLocaleTimeString()}] [Core] Initiating security scan on target: ${scanState.targetEndpoint}...`,
        `[${new Date().toLocaleTimeString()}] [OWASP-A01] Checking Broken Access Control bindings...`,
        `[${new Date().toLocaleTimeString()}] [OWASP-A03] Running SQL Injection and XSS fuzzing scripts...`,
        `[${new Date().toLocaleTimeString()}] [API-Security] Verifying JWT signature validations and token lifetime rules...`,
        `[${new Date().toLocaleTimeString()}] [Upload-Security] Checking file mime-type verification filters...`
      ];

      return NextResponse.json({ success: true, message: "Scan started." });
    }

    if (action === "update_progress") {
      const { progressValue } = body;
      scanState.progress = progressValue;
      
      if (progressValue >= 100) {
        scanState.isScanning = false;
        scanState.progress = 100;
        
        // Add some more logs
        scanState.logs.push(`[${new Date().toLocaleTimeString()}] [OWASP-A03] Match found! Stored XSS vulnerable input detected at /api/v1/streams/metadata.`);
        scanState.logs.push(`[${new Date().toLocaleTimeString()}] [Core] Scan complete. 3 vulnerabilities identified. Overall risk score: 6.8 / 10.`);
        
        // Update findings with a new one to simulate scanning
        scanState.riskScore = 6.8;
      } else {
        scanState.logs.push(`[${new Date().toLocaleTimeString()}] [Scanner] Testing payloads... progress: ${progressValue}%`);
      }

      return NextResponse.json({ success: true, progress: scanState.progress });
    }

    if (action === "reset") {
      scanState = {
        isScanning: false,
        progress: 0,
        targetEndpoint: "https://api.livestream-platform.example.com",
        riskScore: 3.4,
        findings: [
          {
            id: "vuln-01",
            category: "Broken Object Level Authorization (BOLA)",
            owasp: "API1:2023",
            severity: "high",
            endpoint: "/api/v1/channels/{channelId}/billing",
            description: "Endpoint allows standard users to read billing structures of other channels by modifying the channelId parameter in the request URI.",
            evidence: "HTTP 200 returned for unauthorized channel ID query",
            remediation: "Implement strict tenancy checking on resource ownership in the backend access handler."
          },
          {
            id: "vuln-02",
            category: "Cross-Site Scripting (Stored XSS)",
            owasp: "A03:2021-Injection",
            severity: "medium",
            endpoint: "/api/v1/streams/metadata",
            description: "The stream description input does not sanitize HTML tags before database persistence, which renders in the public HLS player page layout.",
            evidence: "Injected payload <script>alert(1)</script> was stored and rendered",
            remediation: "Sanitize all incoming string input payloads using DOMPurify or equivalent backend library."
          },
          {
            id: "vuln-03",
            category: "Rate Limit Missing (Broken Authenticated API)",
            owasp: "A04:2021-Design",
            severity: "low",
            endpoint: "/api/v1/auth/forgot-password",
            description: "No rate limit is enforced on password reset mail trigger endpoint, allowing mass mail spamming and potential server fatigue.",
            evidence: "Sent 500 requests in 10 seconds; all returned HTTP 200 Success",
            remediation: "Implement IP and User-based rate limiting on sensitive transactional endpoints."
          }
        ],
        logs: [
          "Scan ready. Awaiting trigger..."
        ]
      };
      return NextResponse.json({ success: true, message: "Security scanner simulator reset." });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
