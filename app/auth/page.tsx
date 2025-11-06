"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useIsSignedIn, useEvmAddress, useCurrentUser } from "@coinbase/cdp-hooks"
import { AuthModal } from "@/components/auth-modal"
import { Header } from "@/components/header"
import { LoadingState } from "@/components/loading-state"

// Force dynamic rendering to prevent SSG issues with wagmi
export const dynamic = 'force-dynamic'

export default function AuthPage() {
  const [mounted, setMounted] = useState(false)
  const [connectionChecked, setConnectionChecked] = useState(false)
  const { isSignedIn } = useIsSignedIn()
  const { evmAddress } = useEvmAddress()
  const { currentUser } = useCurrentUser()
  const router = useRouter()

  // Use EOA address for user operations
  const address = currentUser?.evmAccounts?.[0] || evmAddress
  const isConnected = isSignedIn

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setConnectionChecked(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Handle routing after authentication
  useEffect(() => {
    if (!connectionChecked || !mounted) return

    if (isConnected && address) {
      // Check if user already has a profile
      const checkUserProfile = async () => {
        try {
          const response = await fetch(`/api/user/${address}`)
          if (response.ok) {
            // User exists, go to dashboard
            router.push("/dashboard")
          } else {
            // User doesn't exist, go to onboarding
            router.push("/onboarding")
          }
        } catch {
          // Error checking user, go to onboarding
          router.push("/onboarding")
        }
      }
      
      checkUserProfile()
    }
  }, [isConnected, address, router, connectionChecked, mounted])

  // Show loading state while checking connection
  if (!mounted || !connectionChecked) {
    return (
      <>
        <Header />
        <LoadingState />
      </>
    )
  }

  // If already connected, show loading while checking profile
  if (isConnected) {
    return (
      <>
        <Header />
        <LoadingState />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-start justify-center p-4 pt-48">
        <div className="w-full max-w-xl">
          <AuthModal />
        </div>
      </div>
    </>
  )
}
