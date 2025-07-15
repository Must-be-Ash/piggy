import type React from "react";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
// import { Providers } from "./providers";
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: "#FF6D38",
};

export const metadata: Metadata = {
  title: "Navigate Navicom | Reclaim Data Ownership",
  description:
    "Take control of your data and earn rewards with Navicom Nodes. Join the revolution of decentralized intelligence today.",
  keywords: [
    "Navigate",
    "Navicom",
    "Data Ownership",
    "Decentralized Intelligence",
    "Node",
    "Computing Device",
    "Blockchain",
  ],
  authors: [{ name: "Navigate Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/icon.png' },
    ],
    other: [
      { 
        rel: 'android-chrome',
        url: '/android-chrome-192x192.png',
        sizes: '192x192'
      },
      { 
        rel: 'android-chrome',
        url: '/android-chrome-512x512.png',
        sizes: '512x512'
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Navigate Navicom | Reclaim Data Ownership",
    description: "Take control of your data and earn rewards with Navicom Nodes. Join the revolution of decentralized intelligence today.",
    url: "https://mint.nvg8.io",
    siteName: "Navigate Navicom",
    type: "website",
    images: [
      {
        url: "https://mint.nvg8.io/og.jpg",
        width: 1200,
        height: 630,
        alt: "Navigate Navicom - Own Your Data, Power The Future",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Navigate Navicom | Reclaim Data Ownership",
    description: "Take control of your data and earn rewards with Navicom Nodes. Join the revolution of decentralized intelligence today.",
    images: ["https://mint.nvg8.io/og.jpg"],
  },
  metadataBase: new URL("https://mint.nvg8.io"),
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://mint.nvg8.io/og.jpg","button":{"title":"Open Navicom","action":{"type":"launch_frame","url":"https://mint.nvg8.io","name":"Navigate Navicom"}}}'
        />
      </head>
      <body className="antialiased bg-white text-nvg8-offblack">
        {children}
      </body>
    </html>
  );
}
