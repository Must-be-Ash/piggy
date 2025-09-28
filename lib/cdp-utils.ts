// CDP (Coinbase Developer Platform) utilities for PiggyBanks
import { parseUnits, encodeFunctionData } from 'viem'

export const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
export const USDC_DECIMALS = 6

export interface SmartAccountCall {
  to: `0x${string}`
  value: bigint
  data: `0x${string}`
}

// Prepare USDC transfer call for Smart Account with gas sponsorship
export function prepareUSDCTransferCall(
  recipientAddress: string,
  amount: string
): SmartAccountCall {
  const amountWei = parseUnits(amount, USDC_DECIMALS) // USDC has 6 decimals

  // Encode transfer function call: transfer(address to, uint256 amount)
  const transferData = encodeFunctionData({
    abi: [
      {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      }
    ],
    functionName: 'transfer',
    args: [recipientAddress as `0x${string}`, amountWei]
  })

  return {
    to: USDC_BASE_ADDRESS as `0x${string}`,
    value: BigInt(0),
    data: transferData
  }
}

// Get network name for CDP (Base mainnet vs testnet)
export function getCDPNetworkName(): 'base' | 'base-sepolia' {
  return process.env.NODE_ENV === 'development' ? 'base-sepolia' : 'base'
}

export function formatAddress(address: string): string {
  if (!address) return ''
  if (address.length <= 20) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}