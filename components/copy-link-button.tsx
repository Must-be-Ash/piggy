"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, Share } from "lucide-react"
import { SiFarcaster } from "react-icons/si"
import { useToast } from "@/hooks/use-toast"

interface CopyLinkButtonProps {
  url?: string
  text?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
  showIcon?: boolean
  iconOnly?: boolean
}

export function CopyLinkButton({ 
  url,
  text = "Copy Link",
  variant = "outline",
  size = "default",
  className = "",
  showIcon = true,
  iconOnly = false
}: CopyLinkButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      const linkToCopy = url || (typeof window !== 'undefined' ? window.location.href : '')
      await navigator.clipboard.writeText(linkToCopy)
      
      setIsCopied(true)
      toast({
        title: "Link copied!",
        description: "The donation page link has been copied to your clipboard.",
      })
      
      // Reset the icon after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast({
        title: "Copy failed",
        description: "Failed to copy the link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getIcon = () => {
    if (!showIcon) return null
    
    if (isCopied) {
      return <Check className="h-4 w-4" />
    }
    
    return <Copy className="h-4 w-4" />
  }

  if (iconOnly) {
    return (
      <Button
        onClick={handleCopy}
        variant={variant}
        size={size}
        className={`${className}`}
        title={isCopied ? "Copied!" : "Copy link"}
      >
        {getIcon()}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={`${className}`}
    >
      {showIcon && (
        <>
          {getIcon()}
          {!iconOnly && <span className="ml-2">{isCopied ? "Copied!" : text}</span>}
        </>
      )}
      {!showIcon && (isCopied ? "Copied!" : text)}
    </Button>
  )
}

// Additional sharing component for social media
interface ShareButtonProps {
  url?: string
  title?: string
  text?: string
  platform: "twitter" | "farcaster"
  className?: string
  size?: "sm" | "default" | "lg"
}

export function ShareButton({
  url,
  title: _title = "Support me with crypto donations",
  text = "Check out my donation page",
  platform,
  className = "",
  size = "default"
}: ShareButtonProps) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  
  const getShareUrl = () => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(text)
    
    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
      case "farcaster":
        return `https://warpcast.com/~/compose?text=${encodedText}%20${encodedUrl}`
      default:
        return shareUrl
    }
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case "twitter":
        return "𝕏"
      case "farcaster":
        return <SiFarcaster className="h-4 w-4 text-current" />
      default:
        return <Share className="h-4 w-4" />
    }
  }

  const handleShare = () => {
    window.open(getShareUrl(), '_blank', 'width=600,height=400')
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size={size}
      className={`${className}`}
      title={`Share on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
    >
      <span className="mr-2">{getPlatformIcon()}</span>
      Share
    </Button>
  )
} 