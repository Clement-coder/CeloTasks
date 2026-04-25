import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineBanner from "@/components/OfflineBanner";
import AiChat from "@/components/AiChat";

export const metadata: Metadata = {
  title: "CeloTasks — Micro tasks. Instant pay. Onchain reputation.",
  description: "Complete small tasks and get paid instantly on Celo using MiniPay. Build your reputation. Earn on your terms.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CeloTasks",
  },
  icons: {
    icon: [
      { url: "/favicon.ico",   sizes: "any" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",   sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "CeloTasks",
    description: "Micro tasks. Instant pay. Onchain reputation.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b0f14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CeloTasks" />
        <meta name="talentapp:project_verification" content="8d3fcd07ab1fe3650ed4f46a695864e8cf6a2490d1822090368b8a3c795886fecf89dc22d85e5e5e2f1114897b86c13f8138ecab341b29c1b4482bcba4b75ec1" />
      </head>
      <body className="min-h-full antialiased" style={{ background: "#0b0f14", color: "#f1f5f9" }}>
        <Providers>
          <ServiceWorkerRegistration />
          <OfflineBanner />
          <Navbar />
          <main className="min-h-screen pb-20 md:pb-0" style={{ background: "#0b0f14" }}>{children}</main>
          <BottomNav />
          <InstallPrompt />
          <AiChat />
        </Providers>
      </body>
    </html>
  );
}
