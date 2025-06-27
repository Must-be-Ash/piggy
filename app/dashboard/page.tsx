"use client"

import type React from "react"

import { useEffect, useState } from "react"

// Force dynamic rendering to prevent SSG issues with wagmi
export const dynamic = 'force-dynamic'
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Copy, ExternalLink, LogOut, Settings, TrendingUp, Check, Shield, User } from "lucide-react"
import { Snout } from "@/components/ui/snout"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useToast } from "@/hooks/use-toast"
import { TextShimmer } from "@/components/ui/text-shimmer"
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
        router.push("/onboarding")
      } finally {
        setIsLoading(false)
      }
    }

    // Only check connection after initial mount and connection check delay
    if (!connectionChecked) {
      return
    }

    if (!isConnected) {
      router.push("/onboarding")
      return
    }

    if (address) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address, router, connectionChecked])

  const copyLink = async () => {
    if (!user?.slug || typeof window === 'undefined') {
      return
    }
    const url = `${window.location.origin}/u/${user.slug}`
    
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      toast({
        title: "Link copied! 📋",
        description: "Share this link to receive donations",
      })
      
      // Reset the checkmark after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
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
      
      {/* Main Section */}
      <div className="relative text-white overflow-hidden min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          {/* Profile Header */}
          <div className="text-center mb-12">
            {/* Profile Avatar */}
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
                Welcome back, {user.displayName}
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Your personalized crypto donation hub is ready to receive support from your community.
              </p>
            </div>

            {/* Wallet Info */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">Connected Wallet</span>
                <code className="text-xs bg-black/30 px-2 py-1 rounded font-mono">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-white/20"
                  onClick={() => window.open(`https://etherscan.io/address/${user.address}`, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="mb-12">
            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {/* Preview Page */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300">
                      <ExternalLink className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#1a202c] mb-2">Preview Page</h3>
                  <p className="text-[#718096] text-sm mb-6 leading-relaxed">
                    See how your donation page appears to visitors and supporters
                  </p>
                  <Button
                    onClick={() => user?.slug && router.push(`/u/${user.slug}`)}
                    disabled={!user?.slug}
                    variant="outline"
                    className="w-full border-2 border-[#2d3748] text-[#2d3748] hover:bg-[#2d3748] hover:text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    View Page
                  </Button>
                </CardContent>
              </Card>

              {/* Share Your Page - Highlighted */}
              <Card className="bg-gradient-to-br from-[#EC9AA6] to-[#d1707e] border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group ring-2 ring-[#EC9AA6]/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300 ${
                      isCopied 
                        ? 'bg-white/20' 
                        : 'bg-white/10'
                    }`}>
                      {isCopied ? (
                        <Check className="h-8 w-8 text-white" />
                      ) : (
                        <Copy className="h-8 w-8 text-white" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isCopied ? 'Link Copied!' : 'Share Your Page'}
                  </h3>
                  <p className="text-white/90 text-sm mb-6 leading-relaxed">
                    {isCopied 
                      ? 'Your donation link is ready to share with supporters' 
                      : 'Copy your personalized donation link to share with supporters'
                    }
                  </p>
                  <Button
                    onClick={copyLink}
                    disabled={!user?.slug}
                    variant="outline"
                    className="w-full border-2 border-white/80 text-white hover:bg-white/20 hover:border-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm bg-white/10"
                  >
                    {isCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </CardContent>
              </Card>

              {/* Edit Profile */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#1a202c] mb-2">Edit Profile</h3>
                  <p className="text-[#718096] text-sm mb-6 leading-relaxed">
                    Update your display name, bio, avatar and page settings
                  </p>
                  <Button
                    onClick={() => router.push("/onboarding")}
                    variant="outline"
                    className="w-full border-2 border-[#2d3748] text-[#2d3748] hover:bg-[#2d3748] hover:text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Layout - Minimal */}
            <div className="md:hidden space-y-3">
              {/* Share Your Page */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCopied 
                        ? 'bg-[#EC9AA6]' 
                        : 'bg-gradient-to-br from-[#2d3748] to-[#4a5568]'
                    }`}>
                      {isCopied ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Copy className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#1a202c]">
                        {isCopied ? 'Link Copied!' : 'Share Your Page'}
                      </h3>
                    </div>
                    <Button
                      onClick={copyLink}
                      disabled={!user?.slug}
                      variant="outline"
                      size="sm"
                      className={`font-medium rounded-lg px-3 py-1.5 text-xs transition-all duration-200 ${
                        isCopied 
                          ? 'border border-[#EC9AA6] text-[#EC9AA6] bg-[#EC9AA6]/10' 
                          : 'border border-[#2d3748] text-[#2d3748] hover:bg-[#2d3748] hover:text-white'
                      }`}
                    >
                      {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Page */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-xl flex items-center justify-center shrink-0">
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#1a202c]">Preview Page</h3>
                    </div>
                    <Button
                      onClick={() => user?.slug && router.push(`/u/${user.slug}`)}
                      disabled={!user?.slug}
                      variant="outline"
                      size="sm"
                      className="border border-[#2d3748] text-[#2d3748] hover:bg-[#2d3748] hover:text-white font-medium rounded-lg px-3 py-1.5 text-xs"
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Profile */}
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-xl flex items-center justify-center shrink-0">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#1a202c]">Edit Profile</h3>
                    </div>
                    <Button
                      onClick={() => router.push("/onboarding")}
                      variant="outline"
                      size="sm"
                      className="border border-[#2d3748] text-[#2d3748] hover:bg-[#2d3748] hover:text-white font-medium rounded-lg px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Profile Information */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8">
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
                              : `piggybanks.xyz/u/${user.slug}`)
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

                  {user?.bio && (
                    <div>
                      <label className="block text-sm font-semibold text-[#4a5568] mb-3 uppercase tracking-wide">Bio</label>
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-3 rounded-xl text-[#1a202c] leading-relaxed">
                        {user.bio}
                      </div>
                    </div>
                  )}
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

                  <div>
                    <label className="block text-sm font-semibold text-[#4a5568] mb-3 uppercase tracking-wide">Member Since</label>
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] px-4 py-3 rounded-xl text-[#1a202c] font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Loading...'}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold rounded-xl transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </Button>
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

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
