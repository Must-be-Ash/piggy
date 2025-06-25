"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Wallet, ExternalLink, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react"
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
import { mainnet, base, polygon, arbitrum, optimism, bsc } from "viem/chains"
import { useToast } from "@/hooks/use-toast"

const SUPPORTED_CHAINS = [mainnet, base, polygon, arbitrum, optimism, bsc]

// Enhanced token mappings for all supported chains
const COMMON_TOKENS: Record<number, Array<{ address: string; symbol: string; decimals: number; name: string }>> = {
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
    { address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", symbol: "WBTC", decimals: 8, name: "Wrapped Bitcoin" },
  ],
  [arbitrum.id]: [
    { address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
    { address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
    { address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", symbol: "WBTC", decimals: 8, name: "Wrapped Bitcoin" },
  ],
  [optimism.id]: [
    { address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", symbol: "USDC", decimals: 6, name: "USD Coin" },
    { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", symbol: "USDT", decimals: 6, name: "Tether USD" },
    { address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
    { address: "0x4200000000000000000000000000000000000006", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
    { address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", symbol: "WBTC", decimals: 8, name: "Wrapped Bitcoin" },
  ],
  [bsc.id]: [
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", decimals: 18, name: "USD Coin" },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", decimals: 18, name: "Tether USD" },
    { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI", decimals: 18, name: "Dai Stablecoin" },
    { address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", symbol: "WETH", decimals: 18, name: "Wrapped Ether" },
    { address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", symbol: "WBTC", decimals: 18, name: "Wrapped Bitcoin" },
  ],
}

interface Token {
  address?: string
  symbol: string
  decimals: number
  name: string
  balance: bigint
  formatted: string
  isNative?: boolean
}

interface EnhancedCryptoDonateModalProps {
  recipientAddress: string
  recipientName: string
  onClose: () => void
}

export function EnhancedCryptoDonateModal({
  recipientAddress,
  recipientName,
  onClose,
}: EnhancedCryptoDonateModalProps) {
  const [selectedChain, setSelectedChain] = useState<number>(mainnet.id)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const [availableTokens, setAvailableTokens] = useState<Token[]>([])
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")

  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const { toast } = useToast()

  // Native balance
  const { data: nativeBalance } = useBalance({
    address,
    chainId: selectedChain,
  })

  // ERC-20 token balances
  const chainTokens = COMMON_TOKENS[selectedChain] || []
  const { data: tokenBalances } = useReadContracts({
    contracts: chainTokens.map((token) => ({
      address: getAddress(token.address),
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address!],
      chainId: selectedChain,
    })),
    query: { enabled: !!address && chainTokens.length > 0 },
  })

  // Gas estimation for native transfers
  const { data: gasEstimate } = useEstimateGas({
    to: recipientAddress as `0x${string}`,
    value: selectedToken?.isNative && amount ? parseUnits(amount, selectedToken.decimals) : undefined,
    chainId: selectedChain,
    query: { enabled: !!selectedToken?.isNative && !!amount && Number.parseFloat(amount) > 0 },
  })

  // Transaction hooks
  const { sendTransaction, isPending: isSendingNative } = useSendTransaction()
  const { writeContract, isPending: isSendingToken } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  })

  // Load available tokens
  useEffect(() => {
    if (!address) return

    setIsLoadingTokens(true)
    setError("")
    const tokens: Token[] = []

    // Add native token
    if (nativeBalance) {
      const currentChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChain)
      if (currentChain) {
        tokens.push({
          symbol: currentChain.nativeCurrency.symbol,
          decimals: currentChain.nativeCurrency.decimals,
          name: currentChain.nativeCurrency.name,
          balance: nativeBalance.value,
          formatted: formatUnits(nativeBalance.value, currentChain.nativeCurrency.decimals),
          isNative: true,
        })
      }
    }

    // Add ERC-20 tokens with balance > 0
    if (tokenBalances) {
      chainTokens.forEach((token, index) => {
        const balanceResult = tokenBalances[index]?.result
        const balance = balanceResult ? BigInt(balanceResult.toString()) : BigInt(0)
        if (balance > BigInt(0)) {
          tokens.push({
            ...token,
            balance,
            formatted: formatUnits(balance, token.decimals),
          })
        }
      })
    }

    setAvailableTokens(tokens)

    // Auto-select first token with balance
    if (tokens.length > 0 && !selectedToken) {
      setSelectedToken(tokens[0])
    }

    setIsLoadingTokens(false)
  }, [address, selectedChain, nativeBalance, tokenBalances, chainTokens])

  const handleChainChange = (chainId: string) => {
    const newChainId = Number.parseInt(chainId)
    setSelectedChain(newChainId)
    setSelectedToken(null)
    setAmount("")
    setError("")

    if (chain?.id !== newChainId) {
      switchChain({ chainId: newChainId })
    }
  }

  const validateDonation = (): string | null => {
    if (!selectedToken || !amount) return "Please select a token and amount"
    
    const amountNum = Number.parseFloat(amount)
    const balanceNum = Number.parseFloat(selectedToken.formatted)
    
    if (amountNum <= 0) return "Amount must be greater than 0"
    if (amountNum > balanceNum) return "Insufficient balance"
    
    // For native tokens, check if user has enough for gas
    if (selectedToken.isNative && gasEstimate) {
      const gasInEth = Number.parseFloat(formatUnits(gasEstimate, 18))
      if (amountNum + gasInEth > balanceNum) {
        return `Insufficient balance for transaction + gas fees (~${gasInEth.toFixed(6)} ${selectedToken.symbol})`
      }
    }
    
    return null
  }

  const handleDonate = async () => {
    if (!selectedToken || !amount || !address) return

    const validationError = validateDonation()
    if (validationError) {
      setError(validationError)
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setError("")

    try {
      const amountWei = parseUnits(amount, selectedToken.decimals)

      if (selectedToken.isNative) {
        // Native token transfer
        sendTransaction(
          {
            to: recipientAddress as `0x${string}`,
            value: amountWei,
            chainId: selectedChain,
          },
          {
            onSuccess: (hash) => {
              setTxHash(hash)
              toast({
                title: "Transaction sent!",
                description: "Your donation is being processed.",
              })
            },
            onError: (error) => {
              const errorMessage = error.message.includes("User rejected") 
                ? "Transaction was cancelled by user"
                : error.message.includes("insufficient funds")
                ? "Insufficient funds for transaction"
                : `Transaction failed: ${error.message}`
              
              setError(errorMessage)
              toast({
                title: "Transaction failed",
                description: errorMessage,
                variant: "destructive",
              })
            },
          },
        )
      } else {
        // ERC-20 token transfer
        writeContract(
          {
            address: getAddress(selectedToken.address!),
            abi: erc20Abi,
            functionName: "transfer",
            args: [recipientAddress as `0x${string}`, amountWei],
            chainId: selectedChain,
          },
          {
            onSuccess: (hash) => {
              setTxHash(hash)
              toast({
                title: "Transaction sent!",
                description: "Your donation is being processed.",
              })
            },
            onError: (error) => {
              const errorMessage = error.message.includes("User rejected") 
                ? "Transaction was cancelled by user"
                : error.message.includes("insufficient funds")
                ? "Insufficient funds for transaction"
                : error.message.includes("transfer amount exceeds balance")
                ? "Transfer amount exceeds token balance"
                : `Transaction failed: ${error.message}`
              
              setError(errorMessage)
              toast({
                title: "Transaction failed",
                description: errorMessage,
                variant: "destructive",
              })
            },
          },
        )
      }
    } catch (error: any) {
      console.error("Donation error:", error)
      const errorMessage = "Failed to send donation. Please try again."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getPresetAmounts = (token: Token) => {
    if (token.symbol === "USDC" || token.symbol === "USDT" || token.symbol === "DAI") {
      return ["5", "10", "25", "50"]
    }
    if (token.symbol === "ETH" || token.symbol === "WETH") {
      return ["0.01", "0.05", "0.1", "0.25"]
    }
    if (token.symbol === "WBTC") {
      return ["0.001", "0.005", "0.01", "0.025"]
    }
    return ["1", "5", "10", "25"]
  }

  const currentChain = SUPPORTED_CHAINS.find((c) => c.id === selectedChain)
  const isWrongNetwork = chain?.id !== selectedChain
  const canDonate = selectedToken && amount && Number.parseFloat(amount) > 0 && !isWrongNetwork && !error

  if (txHash && isConfirming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
            <CardTitle>Processing Donation</CardTitle>
            <CardDescription>Your transaction is being confirmed on the blockchain...</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Transaction Hash: <code className="text-xs">{txHash}</code>
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(`${currentChain?.blockExplorers?.default.url}/tx/${txHash}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (txHash) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Donation Sent! 🎉</CardTitle>
            <CardDescription>Thank you for supporting {recipientName}!</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                {amount} {selectedToken?.symbol} sent successfully
              </p>
              <p className="text-green-600 text-sm mt-1">
                Network: {currentChain?.name}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(`${currentChain?.blockExplorers?.default.url}/tx/${txHash}`, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Transaction
            </Button>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                Send Crypto Tip
              </CardTitle>
              <CardDescription>Support {recipientName} with cryptocurrency</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Connect your wallet to send a donation</p>
              <DynamicWidget />
            </div>
          ) : (
            <>
              {/* Network Selection */}
              <div className="space-y-2">
                <Label>Network</Label>
                <Select value={selectedChain.toString()} onValueChange={handleChainChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CHAINS.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isWrongNetwork && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <p className="text-yellow-800 text-sm">Please switch to {currentChain?.name} to continue</p>
                  </div>
                  <Button size="sm" className="mt-2" onClick={() => switchChain({ chainId: selectedChain })}>
                    Switch Network
                  </Button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Token Selection */}
              <div className="space-y-2">
                <Label>Token</Label>
                {isLoadingTokens ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Detecting tokens...</span>
                  </div>
                ) : availableTokens.length > 0 ? (
                  <Select
                    value={selectedToken?.symbol || ""}
                    onValueChange={(symbol) => {
                      const token = availableTokens.find((t) => t.symbol === symbol)
                      setSelectedToken(token || null)
                      setAmount("")
                      setError("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col">
                              <span>{token.symbol}</span>
                              <span className="text-xs text-gray-500">{token.name}</span>
                            </div>
                            <span className="text-sm text-gray-500 ml-2">
                              {Number.parseFloat(token.formatted).toFixed(4)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No tokens found in your wallet on {currentChain?.name}</p>
                    <p className="text-xs mt-1">Make sure you have tokens or native currency in your wallet</p>
                  </div>
                )}
              </div>

              {/* Amount Selection */}
              {selectedToken && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        setError("")
                      }}
                      step="any"
                    />
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        Balance: {Number.parseFloat(selectedToken.formatted).toFixed(6)} {selectedToken.symbol}
                      </span>
                      {gasEstimate && selectedToken.isNative && (
                        <span className="text-xs">
                          Gas: ~{Number.parseFloat(formatUnits(gasEstimate, 18)).toFixed(6)} {selectedToken.symbol}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gas Fee Warning for ERC-20 tokens */}
                  {selectedToken && !selectedToken.isNative && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <Info className="h-4 w-4 text-blue-600 mr-2" />
                        <p className="text-blue-800 text-sm">
                          Gas fees will be paid in {currentChain?.nativeCurrency.symbol}. Make sure you have enough for transaction fees.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Preset Amounts */}
                  <div className="grid grid-cols-4 gap-2">
                    {getPresetAmounts(selectedToken).map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAmount(preset)
                          setError("")
                        }}
                        className="text-xs"
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>

                  {/* Donate Button */}
                  <Button
                    onClick={handleDonate}
                    disabled={!canDonate || isSendingNative || isSendingToken}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isSendingNative || isSendingToken ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      `Send ${amount || "0"} ${selectedToken.symbol}`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
