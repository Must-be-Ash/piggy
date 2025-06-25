import { NextResponse } from "next/server"
// import crypto from "crypto"

// // Webhook signature validation (Alchemy)
// function validateAlchemySignature(
//   payload: string,
//   signature: string,
//   signingKey: string
// ): boolean {
//   try {
//     const hmac = crypto.createHmac('sha256', signingKey)
//     hmac.update(payload, 'utf8')
//     const expectedSignature = hmac.digest('hex')
    
//     // Remove 'sha256=' prefix if present
//     const cleanSignature = signature.replace('sha256=', '')
    
//     return crypto.timingSafeEqual(
//       Buffer.from(expectedSignature, 'hex'),
//       Buffer.from(cleanSignature, 'hex')
//     )
//   } catch (error) {
//     console.error('Signature validation error:', error)
//     return false
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.text()
//     const signature = request.headers.get('x-alchemy-signature')
    
//     // Validate webhook signature for security
//     const signingKey = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY
//     if (signingKey && signature) {
//       const isValid = validateAlchemySignature(body, signature, signingKey)
//       if (!isValid) {
//         console.error('Invalid webhook signature')
//         return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
//       }
//     } else {
//       console.warn('Webhook signature validation skipped - no signing key configured')
//     }

//     const webhookData = JSON.parse(body)
    
//     // TODO: This will be enhanced once MongoDB is integrated
//     // For now, just log the donation data
//     console.log('Donation webhook received:', {
//       type: webhookData.type,
//       network: webhookData.network,
//       activity: webhookData.event?.activity?.[0] || null
//     })

//     // Extract donation information from webhook
//     const activity = webhookData.event?.activity?.[0]
//     if (activity) {
//       const donationData = {
//         txHash: activity.hash,
//         fromWallet: activity.fromAddress,
//         toWallet: activity.toAddress,
//         chainId: getChainIdFromNetwork(webhookData.event.network),
//         tokenAddress: activity.asset || '0x0', // 0x0 for native tokens
//         amountRaw: activity.value?.toString() || '0',
//         amountFormatted: formatAmount(activity.value, activity.asset),
//         timestamp: new Date(activity.blockTimestamp).toISOString()
//       }

//       // TODO: Save to MongoDB once database integration is complete
//       console.log('Parsed donation data:', donationData)

//       // TODO: Implement real-time notifications
//       // TODO: Update user dashboard with new donation
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Webhook processed successfully' 
//     })

//   } catch (error) {
//     console.error('Webhook processing error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' }, 
//       { status: 500 }
//     )
//   }
// }

// // Helper function to map network names to chain IDs
// function getChainIdFromNetwork(network: string): number {
//   const networkMap: Record<string, number> = {
//     // Major Networks
//     'eth-mainnet': 1,
//     'base-mainnet': 8453,
//     'polygon-mainnet': 137,
//     'arbitrum-mainnet': 42161,
//     'optimism-mainnet': 10,
    
//     // Layer 2s & ZK Rollups
//     'zksync-mainnet': 324,
//     'polygonzkevm-mainnet': 1101,
//     'linea-mainnet': 59144,
//     'scroll-mainnet': 534352,
//     'blast-mainnet': 81457,
//     'mantle-mainnet': 5000,
    
//     // Alternative Layer 1s
//     'avax-mainnet': 43114,
//     'fantom-mainnet': 250,
//     'celo-mainnet': 42220,
//     'gnosis-mainnet': 100,
//     'metis-mainnet': 1088,
    
//     // BSC Family
//     'bnb-mainnet': 56,
//     'opbnb-mainnet': 204,
//   }
//   return networkMap[network] || 1
// }

// // Helper function to format token amounts
// function formatAmount(value: string | number, tokenAddress?: string): string {
//   if (!value) return '0'
  
//   // This is a simplified version - in production you'd want to:
//   // 1. Fetch token decimals from contract or token list
//   // 2. Apply proper decimal formatting
//   // 3. Handle different token types
  
//   const amount = typeof value === 'string' ? parseFloat(value) : value
  
//   // For native tokens (ETH, MATIC, etc.), assume 18 decimals
//   if (!tokenAddress || tokenAddress === '0x0') {
//     return (amount / Math.pow(10, 18)).toFixed(6)
//   }
  
//   // For ERC-20 tokens, this needs token-specific decimal handling
//   return (amount / Math.pow(10, 18)).toFixed(6) // Placeholder
// }

// Simple approach: We'll just use direct RPC calls to check balances and transactions
// No webhooks needed for this use case
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook approach disabled - using simple balance checking instead' 
  })
} 