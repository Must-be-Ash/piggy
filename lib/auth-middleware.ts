import { NextRequest } from 'next/server'
import { verifyMessage } from 'viem'

interface AuthResult {
  isValid: boolean
  address?: string
  error?: string
}

export async function verifyWalletOwnership(
  request: NextRequest,
  targetAddress: string
): Promise<AuthResult> {
  try {
    // Get signature and message from headers
    const signature = request.headers.get('x-wallet-signature')
    const message = request.headers.get('x-wallet-message')
    const timestamp = request.headers.get('x-wallet-timestamp')
    
    if (!signature || !message || !timestamp) {
      return {
        isValid: false,
        error: 'Missing authentication headers'
      }
    }

    // Check if timestamp is recent (within 5 minutes)
    const messageTime = parseInt(timestamp)
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    
    if (now - messageTime > fiveMinutes) {
      return {
        isValid: false,
        error: 'Authentication expired'
      }
    }

    // Verify the signature
    const expectedMessage = `Authenticate with PiggyBanks at ${timestamp}`
    
    if (message !== expectedMessage) {
      return {
        isValid: false,
        error: 'Invalid message format'
      }
    }

    const isValid = await verifyMessage({
      address: targetAddress as `0x${string}`,
      message: expectedMessage,
      signature: signature as `0x${string}`,
    })

    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid signature'
      }
    }

    return {
      isValid: true,
      address: targetAddress.toLowerCase()
    }
    
  } catch (error) {
    console.error('Wallet verification error:', error)
    return {
      isValid: false,
      error: 'Verification failed'
    }
  }
}

export function createAuthMessage(): { message: string; timestamp: number } {
  const timestamp = Date.now()
  const message = `Authenticate with PiggyBanks at ${timestamp}`
  return { message, timestamp }
} 