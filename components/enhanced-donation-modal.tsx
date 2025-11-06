"use client"

import { useState, useEffect, useCallback } from "react"
import { useCurrentUser, useIsSignedIn } from "@coinbase/cdp-hooks"
import { getCurrentUser, toViemAccount } from "@coinbase/cdp-core"
import { useBalance } from "wagmi"
import { baseSepolia } from "viem/chains"
import { formatUnits, type Address, createWalletClient, http, publicActions } from "viem"
import { USDC_BASE_ADDRESS, USDC_DECIMALS } from "@/lib/cdp-utils"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Fund } from "@coinbase/cdp-react/components/Fund"
import { getBuyOptions, createBuyQuote } from "@/lib/onramp-api"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Plus,
} from "lucide-react"


interface EnhancedDonationModalProps {
  isOpen: boolean
  onClose: () => void
  recipientAddress: string
  recipientName?: string
  recipientAvatar?: string
  recipientSlug: string
}

export function EnhancedDonationModal({
  isOpen,
  onClose,
  recipientAddress,
  recipientName = "Creator",
  recipientAvatar,
  recipientSlug,
}: EnhancedDonationModalProps) {
  const { currentUser } = useCurrentUser()
  const { isSignedIn } = useIsSignedIn()
  const { toast } = useToast()

  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [error, setError] = useState<Error | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const eoaAccount = currentUser?.evmAccounts?.[0]

  const { data: usdcBalance, refetch: refetchBalance } = useBalance({
    address: eoaAccount as Address,
    token: USDC_BASE_ADDRESS,
    chainId: baseSepolia.id,
  })

  useEffect(() => {
    if (eoaAccount) {
      refetchBalance()
    }
  }, [eoaAccount, refetchBalance])

  useEffect(() => {
    if (status === "success") {
      setTimeout(() => {
        onClose()
        setAmount("")
        setMessage("")
      }, 2000)
    }
  }, [status, onClose])

  const handleDonate = async () => {
    if (!eoaAccount || !amount || !recipientAddress) {
      toast({
        title: "Error",
        description: "Please enter an amount",
        variant: "destructive",
      })
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const balanceNum = usdcBalance ? parseFloat(formatUnits(usdcBalance.value, USDC_DECIMALS)) : 0
    if (amountNum > balanceNum) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${balanceNum.toFixed(2)} USDC`,
        variant: "destructive",
      })
      return
    }

    try {
      setStatus("pending")
      setError(null)

      // Import x402-fetch
      const { wrapFetchWithPayment } = await import("x402-fetch")

      // Create viem client from CDP embedded wallet
      const user = await getCurrentUser()
      if (!user || !user.evmAccounts || user.evmAccounts.length === 0) {
        throw new Error("No wallet account found")
      }

      const viemAccount = await toViemAccount(user.evmAccounts[0])
      const chain = baseSepolia
      const rpcUrl = 'https://sepolia.base.org'

      const viemClient = createWalletClient({
        account: viemAccount,
        chain: chain,
        transport: http(rpcUrl),
      }).extend(publicActions)

      // Create wrapped fetch with x402 payment handling
      // Max payment: $1000 USDC (safety limit)
      const fetchWithPayment = wrapFetchWithPayment(
        fetch,
        viemClient as any, // eslint-disable-line @typescript-eslint/no-explicit-any -- viem client types are compatible but complex
        BigInt(1000 * 10 ** USDC_DECIMALS)
      ) as typeof fetch

      // Make request with x402 payment handling
      const response = await fetchWithPayment("/api/send-tip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientSlug,
          amount,
          message,
          senderAddress: eoaAccount,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Payment failed")
      }

      const result = await response.json()

      setStatus("success")
      setTxHash(result.donation?.id || "success")

      toast({
        title: "Donation Sent! 🎉",
        description: `${amount} USDC sent to ${recipientName}`,
      })

      refetchBalance()
    } catch (err) {
      console.error("Donation error:", err)
      const errorMessage = err instanceof Error ? err.message : "Transaction failed"
      setStatus("error")
      setError(err instanceof Error ? err : new Error(errorMessage))
      toast({
        title: "Donation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Onramp success handler
  const handleFundSuccess = useCallback(() => {
    refetchBalance(); // Refresh USDC balance after successful purchase
    toast({
      title: "USDC Purchase Successful! 🎉",
      description: "Your wallet has been funded with USDC",
    });
  }, [refetchBalance, toast]);

  const presetAmounts = [5, 10, 25, 50]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="relative pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={status === "pending"}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="flex items-center gap-4 mt-2">
            <Avatar className="h-16 w-16 border-2 border-[#EC9AA6]">
              <AvatarImage src={recipientAvatar} alt={recipientName} />
              <AvatarFallback className="bg-gradient-to-br from-[#EC9AA6] to-[#f5c6cd] text-white font-bold text-lg">
                {recipientName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold text-[#1a202c]">
                Send USDC
              </CardTitle>
              <CardDescription className="text-[#718096]">
                to {recipientName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isSignedIn ? (
            <div className="text-center space-y-4 py-8">
              <div className="text-gray-600 mb-4">Sign in to send a donation</div>
              <div className="modern-auth-button w-full">
                <button
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            <>

              <div className="space-y-4">
                {usdcBalance && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Your USDC Balance (Base Sepolia)</p>
                        <p className="text-lg font-bold text-gray-900">
                          {parseFloat(formatUnits(usdcBalance.value, USDC_DECIMALS)).toFixed(2)} USDC
                        </p>
                      </div>
                      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                          <div className="modern-auth-button-small">
                            <button>
                              <Plus className="h-4 w-4 mr-1" />
                              Top up
                            </button>
                          </div>
                        </DrawerTrigger>
                        <DrawerContent className="max-w-md mx-auto">
                          <DrawerHeader className="text-center">
                            <DrawerTitle className="text-xl font-bold text-gray-900">Deposit USDC</DrawerTitle>
                          </DrawerHeader>
                          <div className="p-6 space-y-6">
                            {eoaAccount && (
                              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <Fund
                                  country="US"
                                  subdivision="CA"
                                  cryptoCurrency="USDC"
                                  fiatCurrency="USD"
                                  fetchBuyQuote={createBuyQuote}
                                  fetchBuyOptions={getBuyOptions}
                                  network="base-sepolia"
                                  onSuccess={handleFundSuccess}
                                />
                              </div>
                            )}
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Amount (USDC)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 text-lg h-12"
                    step="0.01"
                    min="0"
                    disabled={status === "pending"}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((preset) => (
                    <div key={preset} className="modern-auth-button-small">
                      <button
                        onClick={() => setAmount(preset.toString())}
                        disabled={status === "pending"}
                      >
                        ${preset}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Message (Optional)
                </label>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice..."
                  className="h-10"
                  disabled={status === "pending"}
                  maxLength={200}
                />
              </div>

              <div className="modern-auth-button w-full">
                <button
                  onClick={handleDonate}
                  disabled={status === "pending" || !amount || parseFloat(amount) <= 0}
                >
                  {status === "pending" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </span>
                  ) : status === "success" ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Sent!
                    </span>
                  ) : (
                    `Send ${amount || "0"} USDC`
                  )}
                </button>
              </div>

              {status === "error" && error && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Transaction Failed</p>
                    <p className="text-xs text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              )}

              {status === "success" && txHash && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1">✅ Donation Successful!</p>
                  <p className="text-xs text-green-700">
                    Payment processed via x402 (gas-less)
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}