"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  X, 
  Wallet, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Heart,
  Zap,
  Shield,
  ChevronDown,
  Copy
} from "lucide-react"
import {
  useAccount,
  useBalance,
  useReadContracts,
  useSendTransaction,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useEstimateGas,
} from "wagmi"
import { DynamicWidget } from "@dynamic-labs/sdk-react-core"
import { erc20Abi, formatUnits, parseUnits, getAddress } from "viem"
import { 
  mainnet, 
  base, 
  polygon, 
  arbitrum, 
  optimism, 
  bsc,
  avalanche,
  fantom,
  linea,
  scroll,
  mantle,
  blast
} from "viem/chains"
import { useToast } from "@/hooks/use-toast"
import { useTokenDetection, type TokenWithBalance } from "@/lib/token-detection"
import { getTokenPrice, calculateTokenAmount, calculateUsdValue, isStablecoin, getFallbackPrice } from "@/lib/price-service"
import { getSmartPresets, formatPresetAmount, formatButtonAmount, calculateDisplayValue } from "@/lib/preset-amounts"

// Expanded chain support with better UX
const SUPPORTED_CHAINS = [
  mainnet, 
  base, 
  polygon, 
  arbitrum, 
  optimism, 
  bsc,
  avalanche,
  fantom,
  linea,
  scroll,
  blast,
  mantle
]

// Enhanced token mappings for all supported chains
const COMMON_TOKENS: Record<number, Array<{ address: string; symbol: string; decimals: number; name: string; logo?: string }>> = {
  [mainnet.id]: [
    { address: "0xA0b86a33E6441b8435b662c8C0b0E4e194c8b0b8", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
    { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8, name: "Wrapped Bitcoin" },
    { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
  ],
  [base.id]: [
    { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
    { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
  ],
  [polygon.id]: [
    { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
    { address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
  ],
  [arbitrum.id]: [
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
    { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
  ],
  [optimism.id]: [
    { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
  ],
  [bsc.id]: [
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18, name: "USD Coin" },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", decimals: 18, name: "Tether USD" },
    { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
  ],
  [avalanche.id]: [
    { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
  ],
  [fantom.id]: [
    { address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0x049d68029688eAbF473097a2fC38ef61633A3C7A", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
  ],
}

// Smart presets are now handled by the preset-amounts service

interface Token {
  address: string
  symbol: string
  decimals: number
  name: string
  balance: string
  balanceFormatted: string
  isNative?: boolean
  logo?: string
}

interface DonationRecipient {
  displayName: string
  avatar?: string
  address: string
}

interface EnhancedDonationModalProps {
  recipient: DonationRecipient
  onClose: () => void
}

type ModalStep = "connect" | "select-chain" | "select-token" | "amount" | "confirm" | "processing" | "success" | "error"

export function EnhancedDonationModal({
  recipient,
  onClose,
}: EnhancedDonationModalProps) {
  const [step, setStep] = useState<ModalStep>("connect")
  const [selectedChain, setSelectedChain] = useState<number>(mainnet.id)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [tokenPrice, setTokenPrice] = useState<number>(0)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { toast } = useToast()

  // Get native balance for the selected chain
  const { data: nativeBalance } = useBalance({
    address,
    chainId: selectedChain,
  })

  // Use our new dynamic token detection
  const { 
    tokens: detectedTokens, 
    loading: isLoadingTokens, 
    error: tokenError 
  } = useTokenDetection(address || '', selectedChain)

  // Debug logging
  useEffect(() => {
    console.log('🔍 Token Detection Debug:', {
      address,
      selectedChain,
      detectedTokens: detectedTokens.length,
      nativeBalance: nativeBalance?.formatted,
      isLoadingTokens,
      tokenError
    })
  }, [address, selectedChain, detectedTokens, nativeBalance, isLoadingTokens, tokenError])

  // Transaction hooks
  const { sendTransaction, isPending: isSendingNative } = useSendTransaction()
  const { writeContract, isPending: isSendingToken } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  // Convert detected tokens and merge with native balance
  const availableTokens: Token[] = useMemo(() => {
    const tokens: Token[] = []
    
    // Add native token with real balance from wagmi
    if (nativeBalance && nativeBalance.value > BigInt(0)) {
      const currentChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChain)
      if (currentChain) {
        tokens.push({
          address: '0x0000000000000000000000000000000000000000',
          symbol: currentChain.nativeCurrency.symbol,
          decimals: currentChain.nativeCurrency.decimals,
          name: currentChain.nativeCurrency.name,
          balance: nativeBalance.value.toString(),
          balanceFormatted: nativeBalance.formatted,
          isNative: true,
        })
      }
    }
    
    // Add detected ERC-20 tokens (excluding native tokens from Alchemy)
    const erc20Tokens = detectedTokens
      .filter(token => !token.isNative)
      .map(token => ({
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
        name: token.name,
        balance: token.balance,
        balanceFormatted: token.balanceFormatted,
        isNative: false,
        logo: token.logo,
      }))
    
    tokens.push(...erc20Tokens)
    
    // Sort: Native first, then by balance (high to low), then alphabetical
    return tokens.sort((a, b) => {
      if (a.isNative && !b.isNative) return -1
      if (!a.isNative && b.isNative) return 1
      
      const aBalance = parseFloat(a.balanceFormatted) || 0
      const bBalance = parseFloat(b.balanceFormatted) || 0
      if (aBalance !== bBalance) return bBalance - aBalance
      
      return a.symbol.localeCompare(b.symbol)
    })
  }, [detectedTokens, nativeBalance, selectedChain])

  // Initialize step based on connection status
  useEffect(() => {
    if (isConnected) {
      setStep("select-chain")
    } else {
      setStep("connect")
    }
  }, [isConnected])

  // Show token detection errors
  useEffect(() => {
    if (tokenError) {
      console.warn('Token detection error:', tokenError)
    }
  }, [tokenError])

  const handleChainSelect = async (chainId: number) => {
    setSelectedChain(chainId)
    setSelectedToken(null)
    setAmount("")
    setCustomAmount("")
    
    if (chain?.id !== chainId) {
      try {
        await switchChain({ chainId })
      } catch (error) {
        console.error("Failed to switch chain:", error)
      }
    }
    
    setStep("select-token")
  }

  const handleTokenSelect = async (token: Token) => {
    setSelectedToken(token)
    setIsLoadingPrice(true)
    setTokenPrice(0)
    
    try {
      // Fetch real-time price for the token
      const price = await getTokenPrice(
        token.symbol, 
        token.address !== '0x0000000000000000000000000000000000000000' ? token.address : undefined,
        selectedChain
      )
      
      // If price fetch fails, use fallback for stablecoins
      const finalPrice = price > 0 ? price : getFallbackPrice(token.symbol)
      setTokenPrice(finalPrice)
      
      console.log(`💰 Price set for ${token.symbol}: $${finalPrice}`)
    } catch (error) {
      console.error('Failed to fetch token price:', error)
      setTokenPrice(getFallbackPrice(token.symbol))
    } finally {
      setIsLoadingPrice(false)
    }
    
    setStep("amount")
  }

  const handleAmountSelect = (amountValue: string) => {
    const amountNum = Number.parseFloat(amountValue)
    if (!selectedToken || !validateFunds(amountNum)) {
      return
    }
    setAmount(amountValue)
    setStep("confirm")
  }

  const handleCustomAmount = () => {
    const amountNum = Number.parseFloat(customAmount)
    if (customAmount && amountNum > 0 && selectedToken && validateFunds(amountNum)) {
      setAmount(customAmount)
      setStep("confirm")
    }
  }

  const validateFunds = (amountToSend: number): boolean => {
    if (!selectedToken) return false
    
    const availableBalance = Number.parseFloat(selectedToken.balanceFormatted)
    if (amountToSend > availableBalance) {
      setError(`Insufficient balance. You have ${availableBalance.toFixed(6)} ${selectedToken.symbol} available.`)
      return false
    }
    
    // Clear any previous errors
    setError("")
    return true
  }

  const goToPreviousStep = () => {
    if (step === "select-chain") setStep("connect")
    else if (step === "select-token") setStep("select-chain")
    else if (step === "amount") setStep("select-token")
    else if (step === "confirm") setStep("amount")
    else if (step === "processing") setStep("confirm")
    else if (step === "success" || step === "error") onClose()
  }

  const handleDonate = async () => {
    if (!selectedToken || !amount || !address) return

    // Final validation before transaction
    const amountNum = Number.parseFloat(amount)
    if (!validateFunds(amountNum)) {
      setStep("confirm") // Go back to confirm step to show error
      return
    }

    setStep("processing")
    setError("")

    try {
      const amountWei = parseUnits(amount, selectedToken.decimals)

      if (selectedToken.isNative) {
        // Native token transfer
        sendTransaction({
          to: recipient.address as `0x${string}`,
          value: amountWei,
          chainId: selectedChain,
        }, {
          onSuccess: (hash) => {
            setTxHash(hash)
            setStep("success")
            toast({
              title: "Donation sent! 🎉",
              description: `Successfully sent ${amount} ${selectedToken.symbol} to ${recipient.displayName}`,
            })
          },
          onError: (error: any) => {
            console.error("Native donation failed:", error)
            setError(error.message || "Transaction failed")
            setStep("error")
          }
        })
      } else {
        // ERC-20 token transfer
        writeContract({
          address: selectedToken.address as `0x${string}`,
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipient.address as `0x${string}`, amountWei],
          chainId: selectedChain,
        }, {
          onSuccess: (hash) => {
            setTxHash(hash)
            setStep("success")
            toast({
              title: "Donation sent! 🎉",
              description: `Successfully sent ${amount} ${selectedToken.symbol} to ${recipient.displayName}`,
            })
          },
          onError: (error: any) => {
            console.error("Token donation failed:", error)
            setError(error.message || "Transaction failed")
            setStep("error")
          }
        })
      }
    } catch (error: any) {
      console.error("Donation failed:", error)
      setError(error.message || "Transaction failed")
      setStep("error")
    }
  }

  const copyTransactionHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash)
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard",
      })
    }
  }

  const selectedChainInfo = SUPPORTED_CHAINS.find(c => c.id === selectedChain)

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#2d3748] via-[#4a5568] to-[#1a202c] overflow-hidden">
      {/* Background overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      
      {/* Simple Header with Close */}
      <div className="relative flex items-center justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* Connect Wallet Step */}
          {step === "connect" && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                {/* Recipient Avatar */}
                <div className="mb-6">
                  <Avatar className="w-20 h-20 mx-auto border-4 border-white/20 shadow-lg">
                    <AvatarImage src={recipient.avatar} alt={recipient.displayName} />
                    <AvatarFallback className="bg-gradient-to-br from-[#2d3748] to-[#4a5568] text-white text-2xl font-bold">
                      {recipient.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <h2 className="text-2xl font-bold text-[#1a202c] mb-2">
                  Support {recipient.displayName}
                </h2>
  
                <p className="text-[#718096] mb-8">
                  Connect your wallet to start supporting {recipient.displayName} with crypto donations
                </p>
                
                <div className="space-y-4">
                  {/* Centered wallet widget container */}
                  <div className="flex justify-center">
                    <DynamicWidget />
                  </div>
                  
                  {/* Continue button for already connected users */}
                  {isConnected && (
                    <Button
                      onClick={() => setStep("select-chain")}
                      className="w-full bg-gradient-to-r from-[#2d3748] to-[#4a5568] hover:from-[#1a202c] hover:to-[#2d3748] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Continue to Donate
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#f7fafc] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Zap className="h-6 w-6 text-[#4a5568]" />
                      </div>
                      <p className="text-xs text-[#718096] font-medium">Instant Transfer</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#f7fafc] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-6 w-6 text-[#4a5568]" />
                      </div>
                      <p className="text-xs text-[#718096] font-medium">Secure & Private</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#f7fafc] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Heart className="h-6 w-6 text-[#4a5568]" />
                      </div>
                      <p className="text-xs text-[#718096] font-medium">Any Token</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Select Chain Step */}
          {step === "select-chain" && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-6">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousStep}
                    className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-4 w-4 text-[#4a5568]" />
                  </Button>
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10 border-2 border-gray-200">
                      <AvatarImage src={recipient.avatar} alt={recipient.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-[#2d3748] to-[#4a5568] text-white text-sm font-bold">
                        {recipient.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-[#1a202c]">
                        Support {recipient.displayName}
                      </h2>
                      <p className="text-sm text-[#718096]">Choose a blockchain network</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {SUPPORTED_CHAINS.map((chainInfo) => (
                    <button
                      key={chainInfo.id}
                      onClick={() => handleChainSelect(chainInfo.id)}
                      className="w-full p-4 bg-[#f7fafc] hover:bg-[#edf2f7] rounded-xl transition-colors duration-200 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {chainInfo.name.charAt(0)}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-[#1a202c]">{chainInfo.name}</p>
                          <p className="text-sm text-[#718096]">{chainInfo.nativeCurrency.symbol}</p>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 text-[#718096] group-hover:text-[#4a5568] rotate-[-90deg]" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Select Token Step */}
          {step === "select-token" && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-6">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousStep}
                    className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-4 w-4 text-[#4a5568]" />
                  </Button>
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10 border-2 border-gray-200">
                      <AvatarImage src={recipient.avatar} alt={recipient.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-[#2d3748] to-[#4a5568] text-white text-sm font-bold">
                        {recipient.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <h2 className="text-lg font-bold text-[#1a202c]">
                        Support {recipient.displayName}
                      </h2>
                      <p className="text-sm text-[#718096]">Select token to donate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#718096]">Network</p>
                      <p className="text-sm font-semibold text-[#1a202c]">{selectedChainInfo?.name}</p>
                    </div>
                  </div>
                </div>

                {isLoadingTokens ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#4a5568]" />
                  </div>
                ) : availableTokens.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#718096] mb-4">No tokens with balance found</p>
                    <Button
                      variant="outline"
                      onClick={() => setStep("select-chain")}
                      className="text-[#4a5568] border-[#e2e8f0]"
                    >
                      Try Different Network
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {availableTokens.map((token, index) => (
                      <button
                        key={`${token.symbol}-${index}`}
                        onClick={() => handleTokenSelect(token)}
                        className="w-full p-4 bg-[#f7fafc] hover:bg-[#edf2f7] rounded-xl transition-colors duration-200 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {token.symbol.charAt(0)}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-[#1a202c]">{token.symbol}</p>
                            <p className="text-sm text-[#718096]">{token.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#1a202c]">
                            {parseFloat(token.balanceFormatted).toFixed(6)}
                          </p>
                          <p className="text-sm text-[#718096]">Available</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Amount Selection Step */}
          {step === "amount" && selectedToken && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-6">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousStep}
                    className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-4 w-4 text-[#4a5568]" />
                  </Button>
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10 border-2 border-gray-200">
                      <AvatarImage src={recipient.avatar} alt={recipient.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-[#2d3748] to-[#4a5568] text-white text-sm font-bold">
                        {recipient.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <h2 className="text-lg font-bold text-[#1a202c]">
                        Support {recipient.displayName}
                      </h2>
                      <p className="text-sm text-[#718096]">
                        Donating {selectedToken.symbol} on {selectedChainInfo?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preset amounts */}
                <div className="space-y-4 mb-6">
                  {isLoadingPrice ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#4a5568]" />
                      <span className="text-sm text-[#718096]">Getting current prices...</span>
                    </div>
                  ) : (() => {
                    const smartPresets = getSmartPresets(selectedToken, tokenPrice);
                    
                    return (
                      <>
                        <p className="text-sm font-semibold text-[#4a5568] mb-3">
                          Quick amounts ({smartPresets.label}):
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {smartPresets.amounts.map((preset, index) => {
                            const availableBalance = Number.parseFloat(selectedToken.balanceFormatted);
                            let finalAmount: string;
                            let displayValue: string | null;
                            
                            if (smartPresets.type === 'usd') {
                              // USD-based preset: convert to token amount
                              finalAmount = tokenPrice > 0 ? calculateTokenAmount(preset, tokenPrice) : "0";
                              displayValue = `$${preset}`;
                            } else {
                              // Token-based preset: use amount directly
                              finalAmount = preset.toString();
                              displayValue = calculateDisplayValue(preset, tokenPrice, 'token');
                            }
                            
                            const finalAmountNum = Number.parseFloat(finalAmount);
                            const hasEnoughFunds = finalAmountNum <= availableBalance && finalAmountNum > 0;
                            
                            return (
                              <button
                                key={`${preset}-${index}`}
                                onClick={() => handleAmountSelect(finalAmount)}
                                disabled={!hasEnoughFunds}
                                className={`p-4 rounded-xl transition-colors duration-200 text-center group ${
                                  hasEnoughFunds 
                                    ? "bg-[#f7fafc] hover:bg-[#edf2f7] cursor-pointer" 
                                    : "bg-gray-100 cursor-not-allowed opacity-50"
                                }`}
                              >
                                <p className={`font-bold text-lg ${hasEnoughFunds ? "text-[#1a202c]" : "text-gray-400"}`}>
                                  {smartPresets.type === 'usd' ? `$${preset}` : formatButtonAmount(preset)}
                                </p>
                                <p className={`text-xs ${hasEnoughFunds ? "text-[#718096]" : "text-gray-400"}`}>
                                  {smartPresets.type === 'usd' ? (
                                    <>≈ {formatButtonAmount(Number.parseFloat(finalAmount))} {selectedToken.symbol}</>
                                  ) : (
                                    <>{displayValue || `${formatButtonAmount(preset)} ${selectedToken.symbol}`}</>
                                  )}
                                </p>
                                {!hasEnoughFunds && (
                                  <p className="text-xs text-red-500 mt-1">Insufficient</p>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Custom amount */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#4a5568] mb-2">
                      Custom amount
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value)
                          // Clear error when user starts typing
                          if (error) setError("")
                        }}
                        className={`h-12 text-base border-2 rounded-xl pr-20 ${
                          error ? "border-red-500 focus:border-red-500" : "border-[#e2e8f0] focus:border-[#2d3748]"
                        }`}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-sm font-semibold text-[#4a5568]">
                          {selectedToken.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex flex-col">
                        <p className="text-xs text-[#718096]">
                          Available: {parseFloat(selectedToken.balanceFormatted).toFixed(6)} {selectedToken.symbol}
                        </p>
                        {customAmount && tokenPrice > 0 && (
                          <p className="text-xs text-[#4a5568] font-semibold">
                            ≈ ${(Number.parseFloat(customAmount) * tokenPrice).toFixed(2)} USD
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setCustomAmount(selectedToken.balanceFormatted)}
                        className="text-xs text-[#2d3748] hover:text-[#1a202c] font-semibold"
                      >
                        Use Max
                      </button>
                    </div>
                    
                    {/* Error display */}
                    {error && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCustomAmount}
                    disabled={!customAmount || Number.parseFloat(customAmount) <= 0}
                    className="w-full h-12 bg-gradient-to-r from-[#2d3748] to-[#4a5568] hover:from-[#1a202c] hover:to-[#2d3748] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue with {customAmount || "0"} {selectedToken.symbol}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirm Step */}
          {step === "confirm" && selectedToken && amount && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-6">
                {/* Header with back button */}
                <div className="flex items-center mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousStep}
                    className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-4 w-4 text-[#4a5568]" />
                  </Button>
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10 border-2 border-gray-200">
                      <AvatarImage src={recipient.avatar} alt={recipient.displayName} />
                      <AvatarFallback className="bg-gradient-to-br from-[#2d3748] to-[#4a5568] text-white text-sm font-bold">
                        {recipient.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <h2 className="text-lg font-bold text-[#1a202c]">
                        Support {recipient.displayName}
                      </h2>
                      <p className="text-sm text-[#718096]">Confirm your donation</p>
                    </div>
                  </div>
                </div>

                {/* Donation summary */}
                <div className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-white/20">
                        <AvatarImage src={recipient.avatar} alt={recipient.displayName} />
                        <AvatarFallback className="bg-[#2d3748] text-white">
                          {recipient.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-[#1a202c]">{recipient.displayName}</p>
                        <p className="text-sm text-[#718096]">
                          {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>

                  <div className="border-t border-white pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#718096]">Amount:</span>
                      <div className="text-right">
                        <span className="font-bold text-[#1a202c] text-lg">{amount} {selectedToken.symbol}</span>
                        {tokenPrice > 0 && (
                          <p className="text-xs text-[#718096]">
                            ≈ ${(Number.parseFloat(amount) * tokenPrice).toFixed(2)} USD
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#718096]">Network:</span>
                      <span className="text-[#1a202c]">{selectedChainInfo?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#718096]">Gas fees:</span>
                      <span className="text-[#1a202c]">~$1-5</span>
                    </div>
                  </div>
                </div>

                {/* Error display */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleDonate}
                  disabled={isSendingNative || isSendingToken || !!error}
                  className="w-full h-12 bg-gradient-to-r from-[#2d3748] to-[#4a5568] hover:from-[#1a202c] hover:to-[#2d3748] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingNative || isSendingToken ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirming...
                    </div>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Send Donation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2d3748] to-[#4a5568] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#1a202c] mb-3">
                  Processing Donation
                </h2>
                <p className="text-[#718096] mb-6">
                  Your donation is being processed on the blockchain. This may take a few moments...
                </p>
                
                <div className="bg-[#f7fafc] rounded-xl p-4">
                  <p className="text-sm text-[#718096]">
                    Please keep this window open while we confirm your transaction.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Step */}
          {step === "success" && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#1a202c] mb-3">
                  Donation Sent! 🎉
                </h2>
                <p className="text-[#718096] mb-6">
                  Your {amount} {selectedToken?.symbol} donation to {recipient.displayName} has been successfully sent!
                </p>
                
                {txHash && (
                  <div className="bg-[#f7fafc] rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#718096]">Transaction Hash:</p>
                      <button
                        onClick={copyTransactionHash}
                        className="flex items-center gap-1 text-[#4a5568] hover:text-[#2d3748]"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="text-sm">Copy</span>
                      </button>
                    </div>
                    <p className="text-sm font-mono text-[#1a202c] mt-2 break-all">
                      {txHash.slice(0, 10)}...{txHash.slice(-10)}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={onClose}
                    className="w-full h-12 bg-gradient-to-r from-[#2d3748] to-[#4a5568] hover:from-[#1a202c] hover:to-[#2d3748] text-white font-semibold rounded-xl"
                  >
                    Close
                  </Button>
                  
                  {txHash && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`${selectedChainInfo?.blockExplorers?.default?.url}/tx/${txHash}`, '_blank')}
                      className="w-full h-12 border-[#e2e8f0] text-[#4a5568] hover:bg-[#f7fafc]"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Explorer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Step */}
          {step === "error" && (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#1a202c] mb-3">
                  Transaction Failed
                </h2>
                <p className="text-[#718096] mb-6">
                  {error || "Something went wrong while processing your donation. Please try again."}
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => setStep("confirm")}
                    className="w-full h-12 bg-gradient-to-r from-[#2d3748] to-[#4a5568] hover:from-[#1a202c] hover:to-[#2d3748] text-white font-semibold rounded-xl"
                  >
                    Try Again
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full h-12 border-[#e2e8f0] text-[#4a5568] hover:bg-[#f7fafc]"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 