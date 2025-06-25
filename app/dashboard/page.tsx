"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, Copy, ExternalLink, LogOut, Settings, TrendingUp } from "lucide-react"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useToast } from "@/hooks/use-toast"

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
  const { address, isConnected } = useAccount()
  const { setShowAuthFlow } = useDynamicContext()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      if (!address) {
        console.log("Dashboard: No address available")
        setIsLoading(false)
        return
      }

      console.log("Dashboard: Fetching user for address:", address)
      try {
        const response = await fetch(`/api/user/${address}`)
        console.log("Dashboard: API response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Dashboard: API response data:", data)
          // Extract user from the response since API returns { user: userData }
          const userData = data.user || data
          console.log("Dashboard: User data extracted:", userData)
          setUser(userData)
        } else {
          console.log("Dashboard: User not found, redirecting to onboarding")
          router.push("/onboarding")
        }
      } catch (error) {
        console.error("Dashboard: Error fetching user:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isConnected) {
      console.log("Dashboard: User not connected, redirecting to home")
      router.push("/")
      return
    }

    if (address) {
      fetchUser()
    }
  }, [isConnected, address, router]) // Only depend on external values

  const copyLink = () => {
    if (!user?.slug || typeof window === 'undefined') {
      console.log("Copy link failed - user slug:", user?.slug)
      return
    }
    const url = `${window.location.origin}/u/${user.slug}`
    console.log("Copying URL:", url)
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied!",
      description: "Share this link to receive donations",
    })
  }

  const handleLogout = () => {
    setShowAuthFlow(false)
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Coffee className="h-8 w-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-900">CryptoCoffee</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push(`/u/${user.slug}`)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            View Page
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.displayName}!</h1>
            <p className="text-gray-600">Manage your crypto donation page and track your support.</p>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your donation page</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3">
              <Button variant="outline" className="w-full justify-start" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Page Link
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  console.log("View Public Page clicked, user slug:", user?.slug)
                  if (user?.slug) {
                    router.push(`/u/${user.slug}`)
                  } else {
                    console.error("User slug is undefined:", user)
                  }
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/onboarding")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Page Info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Donation Page</CardTitle>
              <CardDescription>Share this information with your supporters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Page URL</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                      {user?.slug 
                        ? (mounted && typeof window !== 'undefined' 
                            ? `${window.location.origin}/u/${user.slug}` 
                            : `cryptocoffee.app/u/${user.slug}`)
                        : 'Loading...'
                      }
                    </code>
                    <Button size="sm" variant="outline" onClick={copyLink} disabled={!user?.slug}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Wallet Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="bg-gray-100 px-3 py-2 rounded text-sm flex-1">
                      {user?.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : 'Loading...'}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => user?.address && window.open(`https://etherscan.io/address/${user.address}`, "_blank")}
                      disabled={!user?.address}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Display Name</Label>
                <p className="mt-1 text-gray-900">{user?.displayName || 'Loading...'}</p>
              </div>

              {user?.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Bio</Label>
                  <p className="mt-1 text-gray-900">{user.bio}</p>
                </div>
              )}
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
