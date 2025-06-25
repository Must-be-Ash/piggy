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
import { Coffee, LinkIcon, Zap, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthModal } from "@/components/auth-modal"
import { Header } from "@/components/header"
import { LoadingState } from "@/components/loading-state"
import { AvatarUpload } from "@/components/avatar-upload"

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
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
          setAvatar(user.avatar || null)
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
            avatar: avatar,
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
            avatar: avatar,
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
    <div className="min-h-screen bg-gradient-to-br from-[#2d3748] via-[#4a5568] to-[#1a202c]">
      <Header />
      
      {/* Main Section */}
      <div className="relative text-white overflow-hidden min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Coffee className="h-10 w-10 text-[#2d3748]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                {isEditing ? "Edit Your Profile" : "Complete Your Profile"}
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                {isEditing 
                  ? "Update your crypto donation page information" 
                  : "Set up your crypto donation page in just a few steps"
                }
              </p>
            </div>

            {/* Form Section */}
            <div className="max-w-xl mx-auto">
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center">
                      <AvatarUpload
                        currentAvatar={avatar || undefined}
                        onAvatarChange={setAvatar}
                        size="md"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="displayName" className="text-base font-semibold text-[#1a202c]">
                        Display Name *
                      </Label>
                      <Input
                        id="displayName"
                        placeholder="Your name or handle"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={50}
                        required
                        className="h-12 text-base border-2 border-[#e2e8f0] focus:border-[#2d3748] rounded-xl"
                      />
                      <div className="space-y-2">
                        <p className="text-sm text-[#718096]">
                          This will be shown on your donation page
                        </p>
                        {slugStatus.message && (
                          <div className={`flex items-center gap-2 p-3 rounded-lg ${
                            slugStatus.checking 
                              ? 'bg-gray-50 text-gray-600' 
                              : slugStatus.available 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-red-50 text-red-700'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              slugStatus.checking 
                                ? 'bg-gray-400 animate-pulse' 
                                : slugStatus.available 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                            }`}></div>
                            <span className="text-sm font-medium">{slugStatus.message}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-base font-semibold text-[#1a202c]">
                        Bio (Optional)
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell your supporters about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        maxLength={500}
                        className="text-base border-2 border-[#e2e8f0] focus:border-[#2d3748] rounded-xl resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-[#718096]">
                          Share your story and goals
                        </p>
                        <span className="text-sm text-[#718096] font-mono">
                          {bio.length}/500
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border border-[#e2e8f0] p-4 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-[#2d3748] rounded-lg flex items-center justify-center">
                          <LinkIcon className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-semibold text-[#1a202c] text-sm">Your page URL:</span>
                      </div>
                      <div className="bg-white border border-[#e2e8f0] p-3 rounded-lg">
                        <p className="text-sm font-mono text-[#2d3748] break-all">
                          cryptocoffee.app/u/{displayName ? generateSlug(displayName, address || '') : 'your-username'}
                        </p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#2d3748] to-[#4a5568] hover:from-[#1a202c] hover:to-[#2d3748] rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300" 
                      disabled={
                        isLoading || 
                        !displayName.trim() || 
                        slugStatus.checking || 
                        (slugStatus.available === false)
                      }
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Saving...
                        </div>
                      ) : (
                        isEditing ? "Update Profile" : "Create My Page"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
