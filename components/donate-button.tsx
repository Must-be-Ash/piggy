"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Coffee, Gift } from "lucide-react"
import { EnhancedCryptoDonateModal } from "./enhanced-crypto-donate-modal"

interface DonateButtonProps {
  recipientAddress: string
  recipientName: string
  variant?: "default" | "coffee" | "heart" | "gift"
  size?: "sm" | "default" | "lg"
  className?: string
  children?: React.ReactNode
}

export function DonateButton({ 
  recipientAddress, 
  recipientName,
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
            <Coffee className="h-4 w-4 mr-2" />
            Buy me a coffee
          </>
        )
      case "heart":
        return (
          <>
            <Heart className="h-4 w-4 mr-2" />
            Support me
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

  const getButtonClasses = () => {
    const baseClasses = "bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
    
    switch (variant) {
      case "coffee":
        return "bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
      case "heart":
        return "bg-pink-600 hover:bg-pink-700 text-white font-medium transition-colors"
      case "gift":
        return "bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
      default:
        return baseClasses
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        size={size}
        className={`${getButtonClasses()} ${className}`}
      >
        {getButtonContent()}
      </Button>

      {isModalOpen && (
        <EnhancedCryptoDonateModal
          recipientAddress={recipientAddress}
          recipientName={recipientName}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
} 