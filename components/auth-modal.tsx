"use client"

import { useState } from "react"
import { useIsSignedIn, useEvmAddress, useSignInWithEmail, useVerifyEmailOTP, useCurrentUser } from "@coinbase/cdp-hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailInput } from "@/components/auth/email-input"
import { OTPInput } from "@/components/auth/otp-input"
import { Wallet } from "lucide-react"

interface AuthModalProps {
  title?: string
  description?: string
  className?: string
}

type AuthStep = 'email' | 'otp'

export function AuthModal({
  title = "Connect Your Wallet",
  description = "Sign in with email to receive crypto donations",
  className = ""
}: AuthModalProps) {
  const { isSignedIn } = useIsSignedIn()
  const { evmAddress } = useEvmAddress()
  const { currentUser } = useCurrentUser()
  const { signInWithEmail } = useSignInWithEmail()
  const { verifyEmailOTP } = useVerifyEmailOTP()

  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [flowId, setFlowId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = async (emailValue: string) => {
    try {
      setError(null)
      const result = await signInWithEmail({ email: emailValue })
      setEmail(emailValue)
      setFlowId(result.flowId)
      setStep('otp')
    } catch (error) {
      console.error('Email sign-in failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code. Please try again.'
      setError(errorMessage)
      throw error
    }
  }

  const handleOTPSubmit = async (otp: string) => {
    if (!flowId) return

    try {
      setError(null)
      await verifyEmailOTP({
        flowId,
        otp
      })
      // Authentication complete - currentUser will update automatically
    } catch (error) {
      console.error('OTP verification failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
        setError('Invalid or expired code. Please try again or request a new code.')
      } else {
        setError('Verification failed. Please try again.')
      }
      throw error
    }
  }

  const handleBack = () => {
    setStep('email')
    setFlowId(null)
    setError(null)
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl ${className}`}>
      <CardHeader className="text-center pb-10 pt-10">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#EC9AA6] to-[#d88894] rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Wallet className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-[#1a202c] mb-3">
          {isSignedIn ? "Connected" : title}
        </CardTitle>
        {!isSignedIn && (
          <CardDescription className="text-[#718096] text-base">
            {description}
          </CardDescription>
        )}
        {isSignedIn && evmAddress && (
          <CardDescription className="text-[#718096]">
            Smart Wallet: {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="px-10 pb-10">
        {!isSignedIn && (
          <>
            {step === 'email' && (
              <EmailInput onSubmit={handleEmailSubmit} error={error} />
            )}
            {step === 'otp' && (
              <OTPInput
                email={email}
                onSubmit={handleOTPSubmit}
                onBack={handleBack}
                error={error}
              />
            )}
          </>
        )}
        {isSignedIn && currentUser && (
          <div className="text-center space-y-2">
            <p className="text-sm text-[#718096]">Wallet Connected</p>
            {currentUser.evmAccounts?.[0] && (
              <p className="text-xs font-mono text-[#718096]">
                {currentUser.evmAccounts[0].slice(0, 8)}...{currentUser.evmAccounts[0].slice(-6)}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}