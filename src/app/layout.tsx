import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layout-shell";

export const metadata: Metadata = {
  title: "StreamTest AI - SaaS Live Streaming Testing Agent",
  description: "Enterprise-grade testing platform for live-streaming SaaS products. Validate security, load, streams, channels, and billing flows.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
