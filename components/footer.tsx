"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAccount } from "wagmi"
import { useState, useEffect } from "react"

export function Footer() {
  const pathname = usePathname()
  const { address } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide footer on user pages when no wallet is connected (watermark is shown)
  const isUserPage = pathname?.startsWith('/u/')
  const shouldHideFooter = mounted && isUserPage && !address

  if (shouldHideFooter) {
    return null
  }

  return (
    <footer className="w-full py-2 px-4 text-center bg-[#333333]">
      <p className="text-xs text-gray-400">
        powered by{" "}
        <Link 
          href="https://www.piggybanks.xyz/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="transition-all duration-200 hover:font-bold"
          style={{ color: '#EC9AA6' }}
        >
          piggybanks.xyz
        </Link>
        {" "}🐷
      </p>
    </footer>
  )
} 