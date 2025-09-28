"use client"

// import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAccount } from "wagmi"
import { useState, useEffect } from "react"
import { useMiniKit } from "@coinbase/onchainkit/minikit"

export function Footer() {
  const pathname = usePathname()
  const { address } = useAccount()
  const [mounted, setMounted] = useState(false)
  const { context } = useMiniKit()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide footer on user pages when no wallet is connected (watermark is shown instead)
  const isUserPage = pathname?.startsWith('/u/')
  const shouldHideFooter = mounted && isUserPage && !address

  if (shouldHideFooter) {
    return null
  }

  const handleLinkClick = () => {
    if (context) {
      // In mini app context, use SDK action instead of direct link
      // For now, we'll disable the link in mini apps
      return
    }
    
    // In regular web context, use window.open
    window.open("https://www.piggybanks.xyz/", "_blank", "noopener,noreferrer")
  }

  return (
    <footer className="w-full py-2 px-4 text-center bg-[#333333]">
      <p className="text-xs text-gray-400">
        powered by{" "}
        <button
          onClick={handleLinkClick}
          className="transition-all duration-200 hover:font-bold underline cursor-pointer"
          style={{ color: '#EC9AA6' }}
        >
          piggybanks.xyz
        </button>
        {" "}🐷
      </p>
    </footer>
  )
} 