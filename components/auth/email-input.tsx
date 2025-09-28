"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthButton } from "./auth-button"

interface EmailInputProps {
  onSubmit: (email: string) => Promise<void>
  disabled?: boolean
  error?: string | null
}

export function EmailInput({ onSubmit, disabled, error }: EmailInputProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isLoading) return

    setIsLoading(true)
    try {
      await onSubmit(email)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="email" className="text-[#718096] text-base">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled || isLoading}
          required
          className={`bg-white/5 text-[#1a202c] placeholder:text-[#718096] h-12 text-base ${
            error ? 'border-red-400 border-2' : 'border-[#EC9AA6]/30'
          }`}
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <AuthButton
          type="submit"
          disabled={disabled || isLoading || !email}
        >
          {isLoading ? "Sending code..." : "Continue with Email"}
        </AuthButton>
      </div>
    </form>
  )
}