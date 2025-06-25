"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, Copy, ExternalLink, LogOut, Settings, TrendingUp, Check } from "lucide-react"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useToast } from "@/hooks/use-toast"
import { TextShimmer } from "@/components/ui/text-shimmer"

interface User {
  id: string
  address: string
  displayName: string
  bio?: string
  slug: string
  createdAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [connectionChecked, setConnectionChecked] = useState(false)
  const { address, isConnected } = useAccount()
  const { setShowAuthFlow } = useDynamicContext()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    // Give time for wallet connection to be restored
    const timer = setTimeout(() => {
      setConnectionChecked(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      if (!address) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user/${address}`)
        
        if (response.ok) {
          const data = await response.json()
          // Extract user from the response since API returns { user: userData }
          const userData = data.user || data
          setUser(userData)
        } else {
          router.push("/onboarding")
        }
      } catch (error) {
        console.error("Dashboard: Error fetching user:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    // Only check connection after initial mount and connection check delay
    if (!connectionChecked) {
      return
    }

    if (!isConnected) {
      router.push("/")
      return
    }

    if (address) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address, router, connectionChecked]) // Added connectionChecked dependency

  const copyLink = async () => {
    if (!user?.slug || typeof window === 'undefined') {
      return
    }
    const url = `${window.location.origin}/u/${user.slug}`
    
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      toast({
        title: "Link copied!",
        description: "Share this link to receive donations",
      })
      
      // Reset the checkmark after 1 second
      setTimeout(() => {
        setIsCopied(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleLogout = () => {
    setShowAuthFlow(false)
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Main loading icon with enhanced animations */}
          <div className="relative mb-8">
            {/* Outer ring */}
            <div className="absolute inset-0 w-24 h-24 mx-auto">
              <div className="w-full h-full border-4 border-[#e2e8f0] rounded-full"></div>
              <div className="absolute inset-0 w-full h-full border-4 border-transparent border-t-[#2d3748] rounded-full animate-spin"></div>
            </div>
            
            {/* Middle glow effect */}
            <div className="absolute inset-2 bg-gradient-to-br from-[#2d3748]/20 to-[#4a5568]/20 rounded-2xl blur-lg animate-pulse"></div>
            
            {/* Inner container */}
            <div className="relative w-24 h-24 mx-auto bg-white border border-[#e2e8f0] rounded-2xl shadow-lg flex items-center justify-center">
              <div className="relative">
                <Coffee className="h-8 w-8 text-[#2d3748] animate-bounce" style={{ animationDuration: '1.5s' }} />
                {/* Steam effect */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-0.5 h-2 bg-[#718096] rounded-full opacity-40 animate-pulse"></div>
                </div>
                                 <div className="absolute -top-1 left-1/3 transform">
                   <div className="w-0.5 h-1.5 bg-[#718096] rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                 </div>
                 <div className="absolute -top-1 right-1/3 transform">
                   <div className="w-0.5 h-1.5 bg-[#718096] rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Loading text with improved typography */}
          <div className="space-y-4 mb-8">
            <h3 className="text-2xl font-bold text-[#1a202c] tracking-tight">Loading Dashboard</h3>
            <p className="text-[#718096] leading-relaxed">Preparing your personalized crypto donation hub...</p>
          </div>

          {/* Progress indicator */}
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-48 h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2d3748] to-[#4a5568] rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
            <p className="text-xs text-[#a0aec0] font-medium">Setting up your workspace...</p>
          </div>

          {/* Skeleton cards preview */}
          <div className="mt-12 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl p-4 animate-pulse">
                  <div className="w-8 h-8 bg-[#f1f5f9] rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-2 bg-[#f1f5f9] rounded w-3/4"></div>
                    <div className="h-2 bg-[#f1f5f9] rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-[#f1f5f9] rounded w-1/3"></div>
                  <div className="h-3 bg-[#f1f5f9] rounded w-16"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="h-3 bg-[#f1f5f9] rounded w-1/4"></div>
                    <div className="h-8 bg-[#f1f5f9] rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-[#f1f5f9] rounded w-1/3"></div>
                    <div className="h-8 bg-[#f1f5f9] rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-[#e1e5e9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push("/")}
              className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[#2d3748] rounded-xl blur-sm opacity-20"></div>
                <div className="relative p-2.5 sm:p-3 bg-[#2d3748] rounded-xl">
                  <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
              </div>
              <div className="min-w-0 text-left">
                <h1 className="text-lg sm:text-xl font-bold text-[#1a202c] tracking-tight truncate">CryptoCoffee</h1>
                <p className="text-xs text-[#718096] font-medium hidden sm:block">Dashboard</p>
              </div>
            </button>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#4a5568] hover:text-[#2d3748] hover:bg-[#f7fafc] transition-all duration-200 px-2 sm:px-3"
                onClick={() => user?.slug && router.push(`/u/${user.slug}`)}
                disabled={!user?.slug}
              >
                <ExternalLink className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">View Page</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#4a5568] hover:text-[#e53e3e] hover:bg-[#fed7d7] transition-all duration-200 px-2 sm:px-3"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <div className="relative mb-3 sm:mb-4">
            <TextShimmer 
              as="h1"
              duration={3}
              spread={1}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight [--base-color:theme(colors.gray.600)] [--base-gradient-color:theme(colors.black)] dark:[--base-color:theme(colors.gray.400)] dark:[--base-gradient-color:theme(colors.white)]"
            >
              {`Welcome back, ${user?.displayName || 'User'}`}
            </TextShimmer>
            <div className="absolute -bottom-1 left-0 w-16 sm:w-24 h-0.5 bg-gradient-to-r from-[#2d3748] to-transparent"></div>
          </div>
          <p className="text-[#718096] text-base sm:text-lg font-medium max-w-full sm:max-w-2xl leading-relaxed">
            Your personalized crypto donation hub is ready to receive support from your community.
          </p>
        </div>

        {/* Main Actions Grid */}
        <div className="flex justify-center gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 mb-8 sm:mb-12">
          {/* Mobile simplified buttons */}
          <button 
            className="sm:hidden group relative p-3 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#cbd5e0] transition-all duration-200 text-center flex-1 max-w-[110px]"
            onClick={copyLink}
            disabled={!user?.slug}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors duration-300 ${
              isCopied ? 'bg-green-100' : 'bg-[#f7fafc]'
            }`}>
              {isCopied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 text-[#4a5568]" />
              )}
            </div>
            <span className="text-xs font-medium text-[#1a202c] block">
              {isCopied ? 'Copied!' : 'Share'}
            </span>
          </button>

          <button
            className="sm:hidden group relative p-3 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#cbd5e0] transition-all duration-200 text-center flex-1 max-w-[110px]"
            onClick={() => {
              if (user?.slug) {
                router.push(`/u/${user.slug}`)
              }
            }}
            disabled={!user?.slug}
          >
            <div className="w-8 h-8 bg-[#f7fafc] rounded-lg flex items-center justify-center mx-auto mb-2">
              <ExternalLink className="h-3 w-3 text-[#4a5568]" />
            </div>
            <span className="text-xs font-medium text-[#1a202c] block">Preview</span>
          </button>

          <button
            className="sm:hidden group relative p-3 bg-white border border-[#e2e8f0] rounded-xl hover:border-[#cbd5e0] transition-all duration-200 text-center flex-1 max-w-[110px]"
            onClick={() => router.push("/onboarding")}
          >
            <div className="w-8 h-8 bg-[#f7fafc] rounded-lg flex items-center justify-center mx-auto mb-2">
              <Settings className="h-3 w-3 text-[#4a5568]" />
            </div>
            <span className="text-xs font-medium text-[#1a202c] block">Edit</span>
          </button>

          {/* Desktop detailed cards */}
          <button 
            className="hidden sm:block group relative p-8 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#a0aec0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full"
            onClick={copyLink}
            disabled={!user?.slug}
          >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-2 h-2 bg-[#2d3748] rounded-full animate-pulse"></div>
            </div>
            <div className="mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${
                isCopied 
                  ? 'bg-green-100 group-hover:bg-green-200' 
                  : 'bg-[#f7fafc] group-hover:bg-[#2d3748]'
              }`}>
                {isCopied ? (
                  <Check className="h-5 w-5 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                ) : (
                  <Copy className="h-5 w-5 text-[#4a5568] group-hover:text-white transition-colors duration-300" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#1a202c] mb-2 group-hover:text-[#2d3748] transition-colors duration-300">
              {isCopied ? 'Link Copied!' : 'Share Your Page'}
            </h3>
            <p className="text-[#718096] text-sm leading-relaxed group-hover:text-[#4a5568] transition-colors duration-300">
              {isCopied 
                ? 'Your donation link is ready to share with supporters' 
                : 'Copy your personalized donation link to share with supporters'
              }
            </p>
          </button>

          <button
            className="hidden sm:block group relative p-8 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#a0aec0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full lg:col-span-1"
            onClick={() => {
              if (user?.slug) {
                router.push(`/u/${user.slug}`)
              }
            }}
            disabled={!user?.slug}
          >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-2 h-2 bg-[#2d3748] rounded-full animate-pulse"></div>
            </div>
            <div className="mb-4">
              <div className="w-12 h-12 bg-[#f7fafc] rounded-xl flex items-center justify-center group-hover:bg-[#2d3748] group-hover:scale-110 transition-all duration-300">
                <ExternalLink className="h-5 w-5 text-[#4a5568] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#1a202c] mb-2 group-hover:text-[#2d3748] transition-colors duration-300">Preview Page</h3>
            <p className="text-[#718096] text-sm leading-relaxed group-hover:text-[#4a5568] transition-colors duration-300">See how your donation page appears to visitors</p>
          </button>

          <button
            className="hidden sm:block group relative p-8 bg-white border border-[#e2e8f0] rounded-2xl hover:border-[#a0aec0] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full sm:col-span-2 lg:col-span-1"
            onClick={() => router.push("/onboarding")}
          >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-2 h-2 bg-[#2d3748] rounded-full animate-pulse"></div>
            </div>
            <div className="mb-4">
              <div className="w-12 h-12 bg-[#f7fafc] rounded-xl flex items-center justify-center group-hover:bg-[#2d3748] group-hover:scale-110 transition-all duration-300">
                <Settings className="h-5 w-5 text-[#4a5568] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#1a202c] mb-2 group-hover:text-[#2d3748] transition-colors duration-300">Edit Profile</h3>
            <p className="text-[#718096] text-sm leading-relaxed group-hover:text-[#4a5568] transition-colors duration-300">Update your display name, bio, and page settings</p>
          </button>
        </div>

        {/* Profile Information */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1a202c] mb-2">Profile Overview</h2>
            <p className="text-[#718096]">Your donation page details and sharing information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#4a5568] mb-3 uppercase tracking-wide">Page URL</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] px-4 py-3 rounded-xl text-sm font-mono text-[#1a202c] break-all">
                    {user?.slug 
                      ? (mounted && typeof window !== 'undefined' 
                          ? `${window.location.origin}/u/${user.slug}` 
                          : `cryptocoffee.app/u/${user.slug}`)
                      : 'Loading...'
                    }
                  </div>
                  <button 
                    className={`p-3 border border-[#e2e8f0] rounded-xl transition-colors duration-200 shrink-0 ${
                      isCopied 
                        ? 'bg-green-100 hover:bg-green-200' 
                        : 'bg-[#f7fafc] hover:bg-[#edf2f7]'
                    }`}
                    onClick={copyLink} 
                    disabled={!user?.slug}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-[#4a5568]" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#4a5568] mb-3 uppercase tracking-wide">Display Name</label>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-3 rounded-xl text-[#1a202c] font-medium">
                  {user?.displayName || 'Loading...'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#4a5568] mb-3 uppercase tracking-wide">Wallet Address</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] px-4 py-3 rounded-xl text-sm font-mono text-[#1a202c]">
                    {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Loading...'}
                  </div>
                  <button
                    className="p-3 bg-[#f7fafc] hover:bg-[#edf2f7] border border-[#e2e8f0] rounded-xl transition-colors duration-200 shrink-0"
                    onClick={() => user?.address && window.open(`https://etherscan.io/address/${user.address}`, "_blank")}
                    disabled={!user?.address}
                  >
                    <ExternalLink className="h-4 w-4 text-[#4a5568]" />
                  </button>
                </div>
              </div>

              {user?.bio && (
                <div>
                  <label className="block text-sm font-semibold text-[#4a5568] mb-3 uppercase tracking-wide">Bio</label>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-3 rounded-xl text-[#1a202c] min-h-[48px]">
                    {user.bio}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
