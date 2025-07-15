"use client"

import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Header } from "@/components/header"
import CryptoTipLanding from "@/components/crypto-tip-landing"

// Force dynamic rendering to prevent SSG issues with wagmi
export const dynamic = 'force-dynamic'

export default function LandingPage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  // Initialize MiniKit when the app is ready
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <>
      <Header />
      <CryptoTipLanding />
    </>
  )
}
