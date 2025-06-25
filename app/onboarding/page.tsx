"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Coffee, LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthModal } from "@/components/auth-modal"
import { Header } from "@/components/header"
import { LoadingState } from "@/components/loading-state"

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [connectionChecked, setConnectionChecked] = useState(false)
  const [slugStatus, setSlugStatus] = useState<{
    available: boolean | null
    checking: boolean
    message: string
  }>({ available: null, checking: false, message: "" })
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { toast } = useToast()

  const generateSlug = (name: string, address: string) => {
    if (name && name.trim()) {
      return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    }
    // Fallback to wallet address only if no name provided (shouldn't happen now)
    return address?.slice(0, 8).toLowerCase() || "user"
  }

  // Handle connection state and page loading
  useEffect(() => {
    // Give time for wallet connection to be restored
    const timer = setTimeout(() => {
      setConnectionChecked(true)
      setPageLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch existing user data if they're editing
  useEffect(() => {
    const fetchExistingUser = async () => {
      if (!address) return
      
      try {
        const response = await fetch(`/api/get-user?address=${address}`)
        if (response.ok) {
          const data = await response.json()
          const user = data.user || data
          setDisplayName(user.displayName || "")
          setBio(user.bio || "")
          setIsEditing(true)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    if (connectionChecked && isConnected && address) {
      fetchExistingUser()
    }
  }, [address, isConnected, connectionChecked])

  // Debounced slug checking
  const checkSlugAvailability = useCallback(async (name: string) => {
    if (!name.trim() || !address) return
    
    const slug = generateSlug(name, address)
    setSlugStatus({ available: null, checking: true, message: "Checking availability..." })
    
    try {
      const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}&currentAddress=${address}`)
      const data = await response.json()
      
      if (response.ok) {
        setSlugStatus({
          available: data.available,
          checking: false,
          message: data.available 
            ? "✓ Username is available!" 
            : "✗ This username is already taken. Try a different one."
        })
      } else {
        setSlugStatus({ available: null, checking: false, message: "" })
      }
    } catch (error) {
      console.error("Error checking slug:", error)
      setSlugStatus({ available: null, checking: false, message: "" })
    }
  }, [address])

  // Debounce the slug check
  useEffect(() => {
    if (!displayName.trim()) {
      setSlugStatus({ available: null, checking: false, message: "" })
      return
    }

    const timeoutId = setTimeout(() => {
      checkSlugAvailability(displayName)
    }, 500) // 500ms delay

    return () => clearTimeout(timeoutId)
  }, [displayName, checkSlugAvailability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    // Require display name
    if (!displayName.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter a display name for your profile.",
        variant: "destructive",
      })
      return
    }

    // Check if slug is available (final check)
    if (slugStatus.available === false) {
      toast({
        title: "Username not available",
        description: "This username is already taken. Please choose a different one.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const slug = generateSlug(displayName, address)

      // First, check if user already exists
      const checkResponse = await fetch(`/api/get-user?address=${address}`)
      
      let response
      let successMessage = "Profile created! 🎉"
      
      if (checkResponse.ok) {
        // User exists, update them
        response = await fetch(`/api/get-user?address=${address}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName: displayName.trim(),
            bio: bio.trim(),
          }),
        })
        successMessage = "Profile updated! 🎉"
      } else {
        // User doesn't exist, create them
        response = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            displayName: displayName.trim(),
            bio: bio.trim(),
            slug,
          }),
        })
      }

      const data = await response.json()

      if (response.ok) {
        toast({
          title: successMessage,
          description: "Your crypto donation page is now live.",
        })
        router.push(`/u/${data.user.slug}`)
      } else {
        throw new Error(data.error || "Failed to save profile")
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking connection
  if (pageLoading || !connectionChecked) {
    return (
      <LoadingState 
        title="Loading Profile Setup"
        description="Preparing your crypto donation profile workspace..."
        showProgress={true}
        showSkeleton={false}
      />
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <AuthModal 
            title="Connect to Get Started"
            description="Connect your wallet to create your crypto donation page"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Coffee className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">
              {isEditing ? "Edit Your Profile" : "Complete Your Profile"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update your crypto donation page information" 
                : "Set up your crypto donation page in just a few steps"
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="Your name or handle"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  required
                />
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-gray-500">
                    This will be shown on your donation page
                  </p>
                  {slugStatus.message && (
                    <p className={`text-xs ${
                      slugStatus.checking 
                        ? 'text-gray-500' 
                        : slugStatus.available 
                          ? 'text-green-600' 
                          : 'text-red-600'
                    }`}>
                      {slugStatus.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell your supporters about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {bio.length}/500 characters
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <LinkIcon className="h-4 w-4" />
                  <span>Your page will be:</span>
                </div>
                <p className="text-sm font-mono mt-1 break-all">
                  cryptocoffee.app/u/{displayName ? generateSlug(displayName, address || '') : 'your-username'}
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={
                  isLoading || 
                  !displayName.trim() || 
                  slugStatus.checking || 
                  (slugStatus.available === false)
                }
              >
                {isLoading ? "Saving..." : (isEditing ? "Update Profile" : "Create My Page")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
