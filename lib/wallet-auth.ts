"use client"

import { signMessage } from '@wagmi/core'
import { createAuthMessage } from './auth-middleware'

export async function createAuthenticatedHeaders(config: any): Promise<Record<string, string>> {
  try {
    const { message, timestamp } = createAuthMessage()
    
    // Sign the message with the user's wallet
    const signature = await signMessage(config, {
      message
    })

    return {
      'Content-Type': 'application/json',
      'x-wallet-signature': signature,
      'x-wallet-message': message,
      'x-wallet-timestamp': timestamp.toString()
    }
  } catch (error) {
    console.error('Failed to create auth headers:', error)
    throw new Error('Authentication failed')
  }
}

export async function authenticatedFetch(
  url: string, 
  options: RequestInit,
  wagmiConfig: any
): Promise<Response> {
  const authHeaders = await createAuthenticatedHeaders(wagmiConfig)
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders
    }
  })
} 