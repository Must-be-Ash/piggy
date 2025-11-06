"use client"

import { useState, useEffect } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, User } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"
// import { Snout } from "@/components/ui/snout"
import { SiFarcaster } from "react-icons/si"
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa"
import { useAccount } from "wagmi"
import { Header } from "@/components/header"
import { DonateButton } from "@/components/donate-button"
import { CopyLinkButton, ShareButton } from "@/components/copy-link-button"
import { ButtonShimmer } from "@/components/ui/button-shimmer"

interface User {
  id: string
  address: string
  displayName: string
  bio?: string
  avatar?: string
  slug: string
  createdAt: string
  twitter?: string
  farcaster?: string
  github?: string
  linkedin?: string
  website?: string
}

interface DonationPageProps {
  user: User
}

function DonationPageContent({ user }: DonationPageProps) {
  const { address } = useAccount()
  const [isOwnPage, setIsOwnPage] = useState(false)
  const [pageUrl, setPageUrl] = useState('')
  const [mounted, setMounted] = useState(false)
  const [isAddressCopied, setIsAddressCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
    setPageUrl(`${window.location.origin}/u/${user.slug}`)
  }, [user.slug])

  useEffect(() => {
    if (mounted && address && user.address) {
      setIsOwnPage(address.toLowerCase() === user.address.toLowerCase())
    } else {
      setIsOwnPage(false)
    }
  }, [mounted, address, user.address])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(user.address)
      setIsAddressCopied(true)
      setTimeout(() => {
        setIsAddressCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d3748] via-[#4a5568] to-[#1a202c]">
      {/* Header */}
      <Header />

      {/* Main Section */}
      <div className="relative text-white overflow-hidden min-h-[calc(100vh-80px)] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex items-center justify-center flex-1">
          <div className="text-center">
            {/* Profile Avatar */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-xl"></div>
                <Avatar className="relative w-full h-full border-4 border-white shadow-2xl">
                  <AvatarImage 
                    src={user.avatar || undefined} 
                    alt={`${user.displayName}'s profile picture`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-white to-gray-200 text-[#2d3748] text-4xl font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                  {user.displayName}
                </h1>
                {user.bio && (
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Wallet Info */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Verified Wallet</span>
                  <button
                    onClick={copyAddress}
                    className="text-xs bg-black/30 px-2 py-1 rounded font-mono hover:bg-black/50 transition-colors cursor-pointer"
                  >
                    {isAddressCopied ? "Copied!" : `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                  </button>
                </div>
              </div>

              {/* Social Links */}
              {!mounted || !isOwnPage ? (
                /* Show social links for visitors */
                (user.twitter || user.farcaster || user.github || user.linkedin || user.website) && (
                  <div className="flex items-center justify-center gap-3 py-1">
                    {user.twitter && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.twitter, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaXTwitter className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.farcaster && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.farcaster, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <SiFarcaster className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.github && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.github, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaGithub className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.linkedin && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.linkedin, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaLinkedin className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.website && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.website, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaGlobe className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : null}

              {/* Action Buttons */}
              <div className="pt-8">
                {!mounted || !isOwnPage ? (
                  /* Donation Button for Visitors (default on server) */
                  <div className="text-center">
                    <DonateButton
                      recipient={{
                        displayName: user.displayName,
                        avatar: user.avatar,
                        address: user.address,
                        slug: user.slug
                      }}
                      variant="heart"
                      size="lg"
                      className="text-lg px-12 py-6 bg-white hover:bg-gray-50 text-[#2d3748] border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                    />
                  </div>
                ) : (
                  /* Sharing Buttons for Owner (only after client mount) */
                  <div className="text-center space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-2">Your page is live!</h2>
                      <p className="text-gray-300">Share this link to start receiving donations</p>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <CopyLinkButton 
                        url={pageUrl} 
                        variant="outline"
                        size="sm"
                        className="bg-white/10 hover:bg-[#EC9AA6] text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 max-w-[120px]"
                      />
                      <ShareButton 
                        platform="twitter" 
                        url={pageUrl} 
                        text={`Support ${user.displayName} with crypto donations!`}
                        size="sm"
                        className="bg-white/10 hover:bg-[#EC9AA6] text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 max-w-[120px]"
                      />
                      <ShareButton 
                        platform="farcaster" 
                        url={pageUrl} 
                        text={`Support ${user.displayName} with crypto donations!`}
                        size="sm"
                        className="bg-white/10 hover:bg-[#EC9AA6] text-white border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 max-w-[120px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Watermark for non-connected users */}
        {mounted && !address && (
          <div className="relative mt-auto pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="text-center space-y-4">
                <ButtonShimmer
                  size="sm"
                  onClick={() => window.location.href = '/onboarding'}
                  className="text-white"
                >
                  Create your own donation page
                </ButtonShimmer>
                <p className="text-sm text-gray-400">
                  Powered by{" "}
                  <button 
                    onClick={() => window.open('https://piggybanks.xyz', '_blank')}
                    className="font-semibold text-white hover:text-[#EC9AA6] transition-colors underline cursor-pointer"
                  >
                    piggybanks.xyz
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Safe wrapper that handles potential Wagmi provider issues
export function DonationPage({ user }: DonationPageProps) {
  try {
    return <DonationPageContent user={user} />
  } catch (error) {
    console.log("Wagmi error, falling back to no-wallet view:", error)
    
    // Fallback component without wallet functionality
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d3748] via-[#4a5568] to-[#1a202c]">
        <Header />
        <div className="relative text-white overflow-hidden min-h-[calc(100vh-80px)] flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex items-center justify-center flex-1">
            <div className="text-center">
              {/* Profile Avatar */}
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-xl"></div>
                  <Avatar className="relative w-full h-full border-4 border-white shadow-2xl">
                    <AvatarImage 
                      src={user.avatar || undefined} 
                      alt={`${user.displayName}'s profile picture`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-white to-gray-200 text-[#2d3748] text-4xl font-bold">
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                    {user.displayName}
                  </h1>
                  {user.bio && (
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                      {user.bio}
                    </p>
                  )}
                </div>

                {/* Wallet Info */}
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium">Verified Wallet</span>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(user.address)
                          // Show brief feedback
                          const button = event?.target as HTMLElement
                          const originalText = button.textContent
                          button.textContent = "Copied!"
                          setTimeout(() => {
                            button.textContent = originalText
                          }, 2000)
                        } catch (error) {
                          console.error('Failed to copy address:', error)
                        }
                      }}
                      className="text-xs bg-black/30 px-2 py-1 rounded font-mono hover:bg-black/50 transition-colors cursor-pointer"
                    >
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </button>
                  </div>
                </div>

                {/* Social Links */}
                {(user.twitter || user.farcaster || user.github || user.linkedin || user.website) && (
                  <div className="flex items-center justify-center gap-3 py-2">
                    {user.twitter && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.twitter, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaXTwitter className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.farcaster && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.farcaster, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <SiFarcaster className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.github && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.github, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaGithub className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.linkedin && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.linkedin, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaLinkedin className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                    {user.website && (
                      <div className="modern-auth-button-small">
                        <button
                          onClick={() => window.open(user.website, "_blank")}
                          className="w-12 h-12 flex items-center justify-center"
                        >
                          <FaGlobe className="h-4 w-4 text-current" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Donation Button (always show for non-wallet users) */}
                <div className="pt-8">
                  <div className="text-center">
                    <DonateButton
                      recipient={{
                        displayName: user.displayName,
                        avatar: user.avatar,
                        address: user.address,
                        slug: user.slug
                      }}
                      variant="heart"
                      size="lg"
                      className="text-lg px-12 py-6 bg-white hover:bg-gray-50 text-[#2d3748] border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Watermark for non-connected users */}
          <div className="relative mt-auto pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="text-center space-y-4">
                <ButtonShimmer
                  size="sm"
                  onClick={() => window.location.href = '/onboarding'}
                  className="text-white"
                >
                  Create your own donation page
                </ButtonShimmer>
                <p className="text-sm text-gray-400">
                  Powered by{" "}
                  <button 
                    onClick={() => window.open('https://piggybanks.xyz', '_blank')}
                    className="font-semibold text-white hover:text-[#EC9AA6] transition-colors underline cursor-pointer"
                  >
                    piggybanks.xyz
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
