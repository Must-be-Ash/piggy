"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full py-2 px-4 text-center bg-[#333333]">
      <p className="text-xs text-gray-400">
        built by{" "}
        <Link 
          href="https://x.com/Must_be_Ash" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors duration-200"
        >
          @must_be_ash
        </Link>
      </p>
    </footer>
  )
} 