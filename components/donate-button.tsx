"use client"

import { useState } from "react"
import { Heart, Gift } from "lucide-react"
import { Snout } from "@/components/ui/snout"
import { GlassmorphicButton } from "@/components/ui/glassmorphic-button"
import { EnhancedDonationModal } from "./enhanced-donation-modal"

interface DonationRecipient {
  displayName: string
  avatar?: string
  address: string
  slug: string
}

interface DonateButtonProps {
  recipient: DonationRecipient
  variant?: "default" | "coffee" | "heart" | "gift"
  size?: "sm" | "default" | "lg"
  className?: string
  children?: React.ReactNode
}

export function DonateButton({ 
  recipient,
  variant = "default",
  size = "default",
  className = "",
  children
}: DonateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getButtonContent = () => {
    if (children) return children

    switch (variant) {
      case "coffee":
        return (
          <>
            <Snout className="h-4 w-4 mr-2" />
            Buy me a coffee
          </>
        )
      case "heart":
        return (
          <>
            <Heart className="h-4 w-4 mr-2" />
            tip {recipient.displayName}
          </>
        )
      case "gift":
        return (
          <>
            <Gift className="h-4 w-4 mr-2" />
            Send a tip
          </>
        )
      default:
        return "Donate Crypto"
    }
  }

  // Map DonateButton sizes to GlassmorphicButton sizes
  const getGlassmorphicSize = () => {
    switch (size) {
      case "sm":
        return "sm"
      case "lg":
        return "lg"
      default:
        return "md"
    }
  }

  // Use accent variant for the glassmorphic button to make it stand out
  const glassmorphicVariant = variant === "heart" ? "accent" : "default"

  return (
    <>
      <GlassmorphicButton
        onClick={() => setIsModalOpen(true)}
        size={getGlassmorphicSize()}
        variant={glassmorphicVariant}
        className={className}
      >
        {getButtonContent()}
      </GlassmorphicButton>

      {isModalOpen && (
        <EnhancedDonationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recipientAddress={recipient.address}
          recipientName={recipient.displayName}
          recipientAvatar={recipient.avatar}
          recipientSlug={recipient.slug}
        />
      )}
    </>
  )
} 