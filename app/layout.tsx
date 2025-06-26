import type React from "react"
import "./globals.css"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { Web3Provider } from "@/components/web3-provider"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ["latin"] })
const cormorantGaramond = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant"
})

export const viewport: Viewport = {
  themeColor: "#2d3748",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "PiggyBack - Get Tips In Any Tokens",
  description: "Create your personalized crypto donation page and accept tips in any EVM cryptocurrency. Simple, easy, and secure.",
  keywords: "tips, crypto donations, cryptocurrency tips, crypto tipping, donation page, web3 donations, accept crypto, bitcoin donations, ethereum donations",
  authors: [{ name: "PiggyBack" }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      { 
        rel: 'mask-icon', 
        url: '/safari-pinned-tab.svg',
        color: '#2d3748'
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "PiggyBack - Get Tips In Any Tokens",
    description: "Create your personalized crypto donation page and accept tips in any EVM cryptocurrency. Simple, easy, and secure.",
    url: "https://piggyback.app/",
    type: "website",
    images: [
      {
        url: "https://PiggyBack.app/og.png",
        width: 1200,
        height: 630,
        alt: "PiggyBack - Get Tips In Any Tokens"
      },
    ],
    siteName: "PiggyBack",
  },
  twitter: {
    card: "summary_large_image",
    title: "PiggyBack - Get Tips In Any Tokens",
    description: "Create your personalized crypto donation page and accept tips in any EVM cryptocurrency. Simple, easy, and secure.",
    images: ["https://piggyback.app/og.png"],
    creator: "@piggybackapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#333333]">
      <body className={`${inter.className} ${cormorantGaramond.variable} bg-[#333333]`} suppressHydrationWarning>
        <Web3Provider>
          <div className="min-h-screen flex flex-col bg-[#333333]">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <Toaster />
          <Analytics />
        </Web3Provider>
      </body>
    </html>
  )
}
