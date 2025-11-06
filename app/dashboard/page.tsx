"use client"

import type React from "react"

import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'
import { useRouter } from "next/navigation"
import { useIsSignedIn, useEvmAddress, useSignOut, useCurrentUser } from "@coinbase/cdp-hooks"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy, ExternalLink, LogOut, Settings, Check, User } from "lucide-react"

import { Header } from "@/components/header"
import { LoadingState } from "@/components/loading-state"

interface User {
  id: string
  address: string
  displayName: string
  bio?: string
  avatar?: string
  slug: string
  createdAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isWalletCopied, setIsWalletCopied] = useState(false)
  const [connectionChecked, setConnectionChecked] = useState(false)
  const { isSignedIn } = useIsSignedIn()
  const { evmAddress } = useEvmAddress()
  const { currentUser } = useCurrentUser()
  const { signOut } = useSignOut()
  const router = useRouter()

  // Use EOA address for user operations
  const effectiveAddress = currentUser?.evmAccounts?.[0] || evmAddress
  const effectiveConnected = isSignedIn

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setConnectionChecked(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      if (!effectiveAddress) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user/${effectiveAddress}`)

        if (response.ok) {
          const data = await response.json()
          const userData = data.user || data
          setUser(userData)
        } else {
          router.push("/onboarding")
        }
      } catch (error) {
        console.error("Dashboard: Error fetching user:", error)
        router.push("/onboarding")
      } finally {
        setIsLoading(false)
      }
    }

    if (!connectionChecked) {
      return
    }

    if (!effectiveConnected) {
      router.push("/onboarding")
      return
    }

    if (effectiveAddress) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [effectiveConnected, effectiveAddress, router, connectionChecked])

  const copyLink = async () => {
    if (!user?.slug || typeof window === 'undefined') {
      return
    }
    const url = `${window.location.origin}/u/${user.slug}`

    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleLogout = () => {
    signOut()
    router.push("/")
  }

  if (isLoading || !connectionChecked) {
    return (
      <LoadingState
        title="Loading Dashboard"
        description="Preparing your personalized crypto donation hub..."
        showProgress={true}
        showSkeleton={true}
      />
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d3748] via-[#4a5568] to-[#1a202c]">
      <Header />

      <div className="relative text-white overflow-hidden min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-xl"></div>
                <Avatar className="relative w-full h-full border-4 border-white shadow-2xl">
                  <AvatarImage
                    src={user.avatar || undefined}
                    alt={`${user.displayName}'s profile picture`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-white to-gray-200 text-[#2d3748] text-3xl font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Welcome back <br /> <span className="text-[#EC9AA6]">{user.displayName}</span>
              </h1>
       
            </div>

          </div>

          <div className="mb-8 hidden md:block">
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a202c] mb-3">Preview Page</h3>
                  <div className="modern-auth-button w-full">
                    <button 
                      onClick={() => user?.slug && router.push(`/u/${user.slug}`)}
                      disabled={!user?.slug}
                    >
                      View Page
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-xl flex items-center justify-center mx-auto mb-3">
                    {isCopied ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : (
                      <Copy className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a202c] mb-3">
                    {isCopied ? 'Link Copied!' : 'Share Your Page'}
                  </h3>
                  <div className="modern-auth-button w-full">
                    <button 
                      onClick={copyLink}
                      disabled={!user?.slug}
                    >
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a202c] mb-3">Edit Profile</h3>
                  <div className="modern-auth-button w-full">
                    <button 
                      onClick={() => router.push("/onboarding")}
                    >
                      Edit Profile
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#1a202c]">Profile Overview</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-lg text-sm font-mono text-[#1a202c] break-all">
                      {user?.address || 'Loading...'}
                    </div>
                    <div className="modern-auth-button-small">
                      <button
                        onClick={() => {
                          if (user?.address) {
                            navigator.clipboard.writeText(user.address)
                            setIsWalletCopied(true)
                            setTimeout(() => {
                              setIsWalletCopied(false)
                            }, 2000)
                          }
                        }}
                        disabled={!user?.address}
                      >
                        {isWalletCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] px-4 py-2.5 rounded-lg text-sm font-mono text-[#1a202c] break-all">
                      {user?.slug
                        ? (mounted && typeof window !== 'undefined'
                            ? `${window.location.origin}/u/${user.slug}`
                            : `piggybanks.xyz/u/${user.slug}`)
                        : 'Loading...'
                      }
                    </div>
                    <div className="modern-auth-button-small">
                      <button
                        onClick={copyLink}
                        disabled={!user?.slug}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="modern-auth-button-small">
                      <button
                        onClick={() => user?.slug && window.open(`/u/${user.slug}`, "_blank")}
                        disabled={!user?.slug}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-start pt-4 border-t border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <div className="modern-auth-button-small">
                      <button 
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Sign Out
                      </button>
                    </div>
                    <div className="modern-auth-button-small">
                      <button 
                        onClick={() => router.push("/onboarding")}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}