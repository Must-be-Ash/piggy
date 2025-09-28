"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthButton } from "./auth-button"

interface OTPInputProps {
  email: string
  onSubmit: (otp: string) => Promise<void>
  onBack: () => void
  disabled?: boolean
  error?: string | null
}

export function OTPInput({ email, onSubmit, onBack, disabled, error }: OTPInputProps) {
  const [otp, setOTP] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || isLoading) return

    setIsLoading(true)
    try {
      await onSubmit(otp)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="otp" className="text-[#718096] text-base">
          Verification Code
        </Label>
        <p className="text-sm text-[#718096]">
          Enter the code sent to <span className="font-semibold text-[#1a202c]">{email}</span>
        </p>
        <Input
          id="otp"
          type="text"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOTP(e.target.value.replace(/\D/g, "").slice(0, 6))}
          disabled={disabled || isLoading}
          required
          maxLength={6}
          className={`bg-white/5 text-[#1a202c] placeholder:text-[#718096] text-center text-2xl tracking-widest h-14 ${
            error ? 'border-red-400 border-2' : 'border-[#EC9AA6]/30'
          }`}
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <AuthButton
          type="button"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </AuthButton>
        <AuthButton
          type="submit"
          disabled={disabled || isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </AuthButton>
      </div>
    </form>
  )
}