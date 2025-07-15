import type React from "react"
import "./globals.css"
import { Inter, Cormorant_Garamond } from "next/font/google"
import { Web3Provider } from "@/components/web3-provider"
import { MiniKitContextProvider } from "@/components/minikit-provider"
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
  themeColor: "#333333",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "PiggyBanks - Get Tips In Any Tokens",
  description: "Create your personalized crypto donation page and accept tips in any EVM cryptocurrency. Simple, easy, and secure.",
  keywords: [
    "tips", 
    "crypto donations", 
    "cryptocurrency tips", 
    "crypto tipping", 
    "donation page", 
    "web3 donations", 
    "accept crypto", 
    "bitcoin donations", 
    "ethereum donations"
  ],
  authors: [{ name: "PiggyBanks" }],
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
        color: '#333333'
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "PiggyBanks - Get Tips In Any Tokens",
    description: "Create your personalized crypto donation page and accept tips in any EVM cryptocurrency. Simple, easy, and secure.",
    url: "https://piggybanks.xyz",
    siteName: "PiggyBanks",
    type: "website",
    images: [
      {
        url: "https://piggybanks.xyz/og.png",
        width: 1200,
        height: 630,
        alt: "PiggyBanks - Get Tips In Any Tokens"
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PiggyBanks - Get Tips In Any Tokens",
    description: "Create your personalized crypto donation page and accept tips in any EVM cryptocurrency. Simple, easy, and secure.",
    images: ["https://piggybanks.xyz/og.png"],
    creator: "@must_be_must",
  },
  metadataBase: new URL("https://piggybanks.xyz"),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#333333]">
      <head>
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://piggybanks.xyz/og.png","button":{"title":"Launch PiggyBanks","action":{"type":"launch_frame","url":"https://piggybanks.xyz","name":"PiggyBanks"}}}'
        />
      </head>
      <body className={`${inter.className} ${cormorantGaramond.variable} bg-[#333333]`} suppressHydrationWarning>
        <MiniKitContextProvider>
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
        </MiniKitContextProvider>
      </body>
    </html>
  )
}
