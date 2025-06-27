"use client"

import { Header } from "@/components/header"
import CryptoTipLanding from "@/components/crypto-tip-landing"

// Force dynamic rendering to prevent SSG issues with wagmi
export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <>
      <Header />
      <CryptoTipLanding />
    </>
  )
}
