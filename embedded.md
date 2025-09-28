# CDP Embedded Wallets - Complete Integration Guide for Next.js App Router

**Purpose:** The definitive guide for integrating [Coinbase Developer Platform (CDP) Embedded Wallets](https://www.coinbase.com/developer-platform) into existing Next.js App Router applications.

**Scope:** All AI-generated code must follow these exact patterns from the official CDP documentation.

---

## **1. Prerequisites & Setup**

### **Required Node.js Version**
- **Node.js 22+** (Official requirement from CDP docs)

### **Package Installation**

```bash
# Essential packages (always required)
npm install @coinbase/cdp-core @coinbase/cdp-hooks @coinbase/cdp-react

# Server-side validation (required for protected APIs)
npm install @coinbase/cdp-sdk

# Optional: Wagmi integration
npm install @coinbase/cdp-wagmi @tanstack/react-query viem wagmi
```

### **Environment Configuration**

```bash
# .env.local
# Client-side (publicly accessible)
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id_here

# Server-side only (keep secret)
CDP_API_KEY_ID=your_api_key_id_here
CDP_API_KEY_SECRET=your_api_key_secret_here
```

### **CDP Portal Setup**

1. **Sign up** at [CDP Portal](https://portal.cdp.coinbase.com)
2. **Create or select** a project
3. **Copy Project ID** from project settings
4. **Generate API Keys** (for server-side validation)
5. **Configure CORS domains**:
   - Navigate to Embedded Wallets > Domains
   - Add `http://localhost:3000` (development)
   - Add your production domains
   - **Format**: `<scheme>://<host>:<port>`
   - **Maximum**: 50 origins per project

---

## **2. Next.js App Router Architecture**

### **Root Layout (Server Component)**

```typescript
// app/layout.tsx
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Your App",
  description: "Your app description",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### **Provider Component (Client Component)**

```typescript
// src/components/Providers.tsx
"use client"

import { CDPReactProvider } from "@coinbase/cdp-react/components/CDPReactProvider"
import { type Config } from "@coinbase/cdp-core"
import { type AppConfig, type Theme } from "@coinbase/cdp-react"

const CDP_CONFIG: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
}

const APP_CONFIG: AppConfig = {
  name: "Your App Name",
  logoUrl: "/logo.svg", // Optional: displayed in auth components
}

// Optional: Custom theme
const CUSTOM_THEME: Partial<Theme> = {
  "colors-bg-default": "#ffffff",
  "colors-bg-primary": "#0052ff", 
  "colors-fg-default": "#000000",
  "colors-fg-primary": "#0052ff",
  "font-family-sans": "Inter, system-ui, sans-serif",
  "font-size-base": "16px",
}

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG} theme={CUSTOM_THEME}>
      {children}
    </CDPReactProvider>
  )
}
```

### **Page Component (Client Component)**

```typescript
// app/page.tsx
"use client"

import Providers from "@/components/Providers"
import ClientApp from "@/components/ClientApp"

export default function Home() {
  return (
    <Providers>
      <ClientApp />
    </Providers>
  )
}
```

### **Main App Logic (Client Component)**

```typescript
// src/components/ClientApp.tsx
"use client"

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks"
import SignInScreen from "@/components/SignInScreen"
import SignedInScreen from "@/components/SignedInScreen"

export default function ClientApp() {
  const { isInitialized } = useIsInitialized()
  const { isSignedIn } = useIsSignedIn()

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="app">
      {!isSignedIn && <SignInScreen />}
      {isSignedIn && <SignedInScreen />}
    </div>
  )
}
```

---

## **3. Authentication Implementation**

### **Option 1: Simple Integration (AuthButton)**

**Fastest implementation - use this for MVPs:**

```typescript
// src/components/SignInScreen.tsx
"use client"

import { AuthButton } from "@coinbase/cdp-react/components/AuthButton"

export default function SignInScreen() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <p className="mb-6">Please sign in to continue.</p>
        <AuthButton />
      </div>
    </main>
  )
}
```

### **Option 2: Custom Authentication Flow**

**For custom UI and complete control:**

```typescript
// src/components/CustomAuth.tsx
"use client"

import { useState } from 'react'
import { useSignInWithEmail, useVerifyEmailOTP, useIsSignedIn } from '@coinbase/cdp-hooks'

export default function CustomAuth() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [flowId, setFlowId] = useState<string | null>(null)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signInWithEmail } = useSignInWithEmail()
  const { verifyEmailOTP } = useVerifyEmailOTP()
  const { isSignedIn } = useIsSignedIn()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const { flowId } = await signInWithEmail({ email })
      setFlowId(flowId)
      setStep('otp')
    } catch (error) {
      console.error('Failed to send OTP:', error)
      setError('Failed to send verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flowId || !otp) return

    setIsLoading(true)
    setError(null)
    
    try {
      const { user, isNewUser } = await verifyEmailOTP({ flowId, otp })
      console.log('Authentication successful!', { user, isNewUser })
    } catch (error) {
      console.error('Failed to verify OTP:', error)
      setError('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSignedIn) return null

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOTPSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium mb-1">
              Verification Code
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Enter the 6-digit code sent to {email}
            </p>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-center text-lg tracking-wider"
              placeholder="123456"
              maxLength={6}
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setError(null); }}
            className="w-full text-gray-600 underline"
          >
            Back to email
          </button>
        </form>
      )}
    </div>
  )
}
```

### **User Profile & Session Management**

```typescript
// src/components/SignedInScreen.tsx
"use client"

import { useCurrentUser, useEvmAddress, useSignOut } from '@coinbase/cdp-hooks'

export default function SignedInScreen() {
  const { currentUser: user } = useCurrentUser()
  const { evmAddress } = useEvmAddress()
  const { signOut } = useSignOut()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">User Information</h2>
          <p><strong>User ID:</strong> {user?.userId}</p>
          <p><strong>Wallet Address:</strong> {evmAddress}</p>
          {user?.evmAccounts && (
            <p><strong>All Accounts:</strong> {user.evmAccounts.join(', ')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## **4. Transaction Patterns**

### **Base Networks Only (useSendEvmTransaction)**

**For Base and Base Sepolia networks:**

```typescript
// src/components/SendTransaction.tsx
"use client"

import { useState } from 'react'
import { useSendEvmTransaction, useEvmAddress } from '@coinbase/cdp-hooks'

export default function SendTransaction() {
  const { sendEvmTransaction } = useSendEvmTransaction()
  const { evmAddress } = useEvmAddress()
  const [isPending, setIsPending] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendTransaction = async () => {
    if (!evmAddress) return

    setIsPending(true)
    setError(null)
    
    try {
      const { transactionHash } = await sendEvmTransaction({
        transaction: {
          to: evmAddress,                    // Send to yourself for testing
          value: BigInt(1000000000000),      // 0.000001 ETH in wei
          gas: BigInt(21000),                // Standard ETH transfer gas
          chainId: 84532,                    // Base Sepolia testnet
          type: "eip1559",                   // Modern gas fee model
        },
        evmAccount: evmAddress,
        network: "base-sepolia",             // Target network
      })

      setTransactionHash(transactionHash)
      console.log('Transaction sent:', transactionHash)
    } catch (error) {
      console.error('Transaction failed:', error)
      setError(error instanceof Error ? error.message : 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Send Transaction (Base Sepolia)</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {transactionHash ? (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800">Transaction Sent!</h4>
            <p className="text-sm text-green-700 font-mono break-all mt-1">
              {transactionHash}
            </p>
          </div>
          <a 
            href={`https://sepolia.basescan.org/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-600 underline hover:text-blue-800"
          >
            View on Base Sepolia Explorer →
          </a>
          <button
            onClick={() => { setTransactionHash(null); setError(null); }}
            className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Send Another Transaction
          </button>
        </div>
      ) : (
        <button
          onClick={handleSendTransaction}
          disabled={isPending || !evmAddress}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Sending Transaction...' : 'Send 0.000001 ETH to Self'}
        </button>
      )}
    </div>
  )
}
```

### **Non-Base Networks (useSignEvmTransaction + Manual Broadcast)**

**For all other EVM networks:**

```typescript
// src/components/NonBaseTransaction.tsx
"use client"

import { useState } from 'react'
import { useSignEvmTransaction, useEvmAddress } from '@coinbase/cdp-hooks'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

export default function NonBaseTransaction() {
  const { signEvmTransaction } = useSignEvmTransaction()
  const { evmAddress } = useEvmAddress()
  const [isPending, setIsPending] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!evmAddress) return

    setIsPending(true)
    setError(null)
    
    try {
      // Step 1: Sign the transaction with CDP
      const { signedTransaction } = await signEvmTransaction({
        evmAccount: evmAddress,
        transaction: {
          to: evmAddress,
          value: BigInt(1000000000000),    // 0.000001 ETH
          gas: BigInt(21000),
          chainId: 11155111,               // Sepolia
          type: "eip1559",
        }
      })

      // Step 2: Broadcast using viem client
      const client = createPublicClient({
        chain: sepolia,
        transport: http()
      })

      const hash = await client.sendRawTransaction({
        serializedTransaction: signedTransaction
      })

      setTransactionHash(hash)
      console.log('Transaction hash:', hash)
    } catch (error) {
      console.error('Transaction failed:', error)
      setError(error instanceof Error ? error.message : 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Send Transaction (Sepolia)</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {transactionHash ? (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <h4 className="font-medium text-green-800">Transaction Sent!</h4>
            <p className="text-sm text-green-700 font-mono break-all mt-1">
              {transactionHash}
            </p>
          </div>
          <a 
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-600 underline hover:text-blue-800"
          >
            View on Sepolia Explorer →
          </a>
        </div>
      ) : (
        <button
          onClick={handleSend}
          disabled={isPending || !evmAddress}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Processing...' : 'Send Transaction (Sepolia)'}
        </button>
      )}
    </div>
  )
}
```

---

## **5. Server-Side Validation**

### **Authentication Library**

```typescript
// src/lib/cdp-auth.ts
import { CdpClient } from '@coinbase/cdp-sdk'
import { NextRequest } from 'next/server'

const cdpClient = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
})

interface AuthenticationMethod {
  email: string
  type: string
}

interface EndUser {
  userId: string
  evmAccounts: string[]
  evmSmartAccounts: string[]
  solanaAccounts: string[]
  authenticationMethods: AuthenticationMethod[]
}

export interface CDPUser {
  userId: string
  email: string
  evmAccounts: string[]
}

export interface AuthResult {
  success: boolean
  user?: CDPUser
  error?: string
}

export async function validateCDPUser(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' }
    }

    const accessToken = authHeader.substring(7)

    const endUser = await cdpClient.endUser.validateAccessToken({
      accessToken,
    }) as EndUser

    const email = endUser.authenticationMethods?.[0]?.email
    
    if (!email) {
      return { success: false, error: 'No email found in user authentication methods' }
    }

    return { 
      success: true, 
      user: {
        userId: endUser.userId,
        email,
        evmAccounts: endUser.evmAccounts || [],
      }
    }
  } catch (error) {
    const errorMessage = (error as { errorMessage?: string }).errorMessage ??
      (error as { message?: string }).message ?? 'Authentication failed'
    
    return { success: false, error: errorMessage }
  }
}

// Alternative: Direct access token validation
export async function validateAccessToken(accessToken: string): Promise<AuthResult> {
  try {
    const endUser = await cdpClient.endUser.validateAccessToken({
      accessToken,
    }) as EndUser

    const email = endUser.authenticationMethods?.[0]?.email
    
    if (!email) {
      return { success: false, error: 'No email found in user authentication methods' }
    }

    return { 
      success: true, 
      user: {
        userId: endUser.userId,
        email,
        evmAccounts: endUser.evmAccounts || [],
      }
    }
  } catch (error) {
    const errorMessage = (error as { errorMessage?: string }).errorMessage ??
      (error as { message?: string }).message ?? 'Authentication failed'
    
    return { success: false, error: errorMessage }
  }
}
```

### **Protected API Routes**

```typescript
// src/app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateCDPUser } from '@/lib/cdp-auth'

export async function GET(request: NextRequest) {
  const authResult = await validateCDPUser(request)
  
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  return NextResponse.json({ 
    message: 'This is a protected route',
    user: authResult.user,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  const authResult = await validateCDPUser(request)
  
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  const body = await request.json()
  
  // Process authenticated request
  return NextResponse.json({ 
    success: true,
    data: body,
    user: authResult.user 
  })
}
```

### **Example: Check Auth Endpoint**

```typescript
// src/app/api/check-auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CdpClient } from '@coinbase/cdp-sdk'

const cdpClient = new CdpClient({
  apiKeyId: process.env.CDP_API_KEY_ID!,
  apiKeySecret: process.env.CDP_API_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accessToken } = body

    if (!accessToken) {
      return NextResponse.json(
        { isAuthenticated: false, error: 'Missing accessToken parameter' },
        { status: 400 }
      )
    }

    const endUser = await cdpClient.endUser.validateAccessToken({
      accessToken,
    })

    return NextResponse.json({ isAuthenticated: true, endUser })
  } catch (error) {
    const errorMessage =
      (error as { errorMessage?: string }).errorMessage ??
      (error as { message?: string }).message ??
      "Unknown error"
    
    return NextResponse.json({ isAuthenticated: false, error: errorMessage })
  }
}
```

---

## **6. Advanced Patterns**

### **Custom Authentication Hook**

```typescript
// src/hooks/useAuth.ts
"use client"

import { useCurrentUser, useGetAccessToken, useSignOut, useIsSignedIn } from '@coinbase/cdp-hooks'
import { useCallback } from 'react'

export function useAuth() {
  const { currentUser: user } = useCurrentUser()
  const { getAccessToken } = useGetAccessToken()
  const { signOut } = useSignOut()
  const { isSignedIn } = useIsSignedIn()

  const getAuthHeaders = useCallback(async () => {
    try {
      const token = await getAccessToken()
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    } catch (error) {
      console.error('Failed to get access token:', error)
      throw new Error('Authentication failed')
    }
  }, [getAccessToken])

  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = await getAuthHeaders()
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
  }, [getAuthHeaders])

  return {
    user,
    isSignedIn,
    getAuthHeaders,
    makeAuthenticatedRequest,
    signOut,
  }
}
```

### **Server-Side Auth Check Hook**

```typescript
// src/hooks/useServerSideAuth.ts
"use client"

import { useGetAccessToken, useIsSignedIn } from "@coinbase/cdp-hooks"
import { useEffect, useState } from "react"

export default function useServerSideAuth() {
  const { isSignedIn } = useIsSignedIn()
  const { getAccessToken } = useGetAccessToken()
  const [isServerSideAuthenticated, setIsServerSideAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    async function checkAuth() {
      if (!isSignedIn) {
        setIsServerSideAuthenticated(false)
        return
      }
      
      try {
        const accessToken = await getAccessToken()

        const response = await fetch("/api/check-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        })
        
        const { isAuthenticated, endUser, error } = await response.json()
        
        if (isAuthenticated) {
          setIsServerSideAuthenticated(true)
          console.log("Server-side authenticated user:", endUser)
        } else {
          setIsServerSideAuthenticated(false)
          console.log("Server-side auth error:", error)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsServerSideAuthenticated(false)
      }
    }
    
    void checkAuth()
  }, [isSignedIn, getAccessToken])

  return isServerSideAuthenticated
}
```

### **Message & Data Signing**

```typescript
// src/components/SigningDemo.tsx
"use client"

import { useState } from 'react'
import { useSignEvmMessage, useSignEvmTypedData, useSignEvmHash, useEvmAddress } from '@coinbase/cdp-hooks'

export default function SigningDemo() {
  const { signEvmMessage } = useSignEvmMessage()
  const { signEvmTypedData } = useSignEvmTypedData()
  const { signEvmHash } = useSignEvmHash()
  const { evmAddress } = useEvmAddress()
  const [signatures, setSignatures] = useState<{[key: string]: string}>({})

  const handleSignMessage = async () => {
    if (!evmAddress) return

    try {
      const result = await signEvmMessage({
        evmAccount: evmAddress,
        message: "Hello World from CDP Embedded Wallets!"
      })
      
      setSignatures(prev => ({ ...prev, message: result.signature }))
      console.log("Message signature:", result.signature)
    } catch (error) {
      console.error("Message signing failed:", error)
    }
  }

  const handleSignTypedData = async () => {
    if (!evmAddress) return

    try {
      const result = await signEvmTypedData({
        evmAccount: evmAddress,
        typedData: {
          domain: {
            name: "CDP Demo App",
            version: "1",
            chainId: 84532, // Base Sepolia
          },
          types: {
            Person: [
              { name: "name", type: "string" },
              { name: "wallet", type: "address" }
            ]
          },
          primaryType: "Person",
          message: {
            name: "Alice",
            wallet: evmAddress
          }
        }
      })

      setSignatures(prev => ({ ...prev, typedData: result.signature }))
      console.log("Typed data signature:", result.signature)
    } catch (error) {
      console.error("Typed data signing failed:", error)
    }
  }

  const handleSignHash = async () => {
    if (!evmAddress) return

    try {
      const result = await signEvmHash({
        evmAccount: evmAddress,
        hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      })

      setSignatures(prev => ({ ...prev, hash: result.signature }))
      console.log("Hash signature:", result.signature)
    } catch (error) {
      console.error("Hash signing failed:", error)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Message & Data Signing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleSignMessage}
          disabled={!evmAddress}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Sign Message
        </button>
        
        <button
          onClick={handleSignTypedData}
          disabled={!evmAddress}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Sign Typed Data
        </button>
        
        <button
          onClick={handleSignHash}
          disabled={!evmAddress}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          Sign Hash
        </button>
      </div>

      {Object.keys(signatures).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Signatures:</h4>
          {Object.entries(signatures).map(([type, signature]) => (
            <div key={type} className="bg-gray-50 p-2 rounded text-sm">
              <strong>{type}:</strong>
              <br />
              <code className="break-all">{signature}</code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## **7. Wagmi Integration (Optional)**

### **Wagmi Setup**

```typescript
// src/main.tsx (for apps using Wagmi)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Config } from '@coinbase/cdp-core'
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http } from "viem"
import { baseSepolia, base } from 'viem/chains'
import { WagmiProvider, createConfig } from 'wagmi'
import { App } from './App'

const cdpConfig: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
}

const connector = createCDPEmbeddedWalletConnector({
  cdpConfig: cdpConfig,
  providerConfig: {
    chains: [base, baseSepolia],
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http()
    }
  }
})

const wagmiConfig = createConfig({
  connectors: [connector],
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
```

---

## **8. Error Handling & Troubleshooting**

### **Common Next.js Errors**

**If you see these errors, add `"use client"` directive:**
- `TypeError: createContext is not a function`
- `Error: useContext must be used within a Provider`
- `window is not defined` or `document is not defined`
- `ReferenceError: localStorage is not defined`

### **Best Practices**

1. **Authentication State Management**:
   ```typescript
   // Always check if user is already signed in
   const user = await getCurrentUser();
   if (user) {
     // User is already authenticated
     return;
   }
   ```

2. **Error Handling**:
   ```typescript
   import { APIError } from '@coinbase/cdp-core';
   
   try {
     // CDP operations
   } catch (error) {
     if (error instanceof APIError) {
       console.error('CDP API Error:', error.message);
       console.error('Error Type:', error.errorType);
     } else {
       console.error('Unexpected error:', error);
     }
   }
   ```

3. **Security**:
   - Always validate tokens server-side for protected routes
   - Never expose API keys on client-side
   - Use HTTPS in production
   - Configure CORS properly in CDP Portal

---

## **9. Complete Hook Reference**

### **Authentication Hooks**
- `useSignInWithEmail({ email })` - Initiate email auth flow
- `useVerifyEmailOTP({ flowId, otp })` - Verify OTP code
- `useCurrentUser()` - Get authenticated user data
- `useIsSignedIn()` - Check authentication status
- `useSignOut()` - Sign out current user
- `useGetAccessToken()` - Get access token for API calls

### **Wallet Hooks**
- `useEvmAddress()` - Get primary wallet address
- `useEvmAccounts()` - Get all EVM accounts
- `useSendEvmTransaction(params)` - Send transactions (Base networks only)
- `useSignEvmTransaction(params)` - Sign transactions (any EVM network)
- `useSignEvmMessage({ evmAccount, message })` - Sign plain text
- `useSignEvmTypedData({ evmAccount, typedData })` - Sign EIP-712 data
- `useSignEvmHash({ evmAccount, hash })` - Sign message hash
- `useExportEvmAccount({ evmAccount })` - Export private key

### **SDK State Hooks**
- `useIsInitialized()` - Check if SDK is ready
- `useConfig()` - Access CDP configuration

---

## **10. Critical Implementation Rules**

### **✅ ALWAYS DO**

1. **Use `"use client"` directive** for all components using CDP hooks/components
2. **Check `useIsInitialized()`** before authentication flows
3. **Use `BigInt()` constructor** instead of literals (ES2020 compatibility)
4. **Import from correct packages**:
   - Client: `@coinbase/cdp-hooks`, `@coinbase/cdp-react`, `@coinbase/cdp-core`
   - Server: `@coinbase/cdp-sdk`
5. **Validate tokens server-side** for protected routes
6. **Configure CORS** in CDP Portal before deployment

### **❌ NEVER DO**

1. **Mix with other auth providers** (Clerk, Auth0, etc.)
2. **Use CDP hooks in server components**
3. **Expose API keys on client-side**
4. **Use Pages Router patterns** (`_app.tsx`, etc.)
5. **Use `@coinbase/cdp-core` for server operations** (use `@coinbase/cdp-sdk`)
6. **Use BigInt literals** (`21000n` → use `BigInt(21000)`)

### **Network-Specific Rules**

- **`useSendEvmTransaction`**: Base and Base Sepolia only
- **`useSignEvmTransaction`**: Any EVM network (requires separate broadcasting)
- **Testnet Faucets**: Base Sepolia faucet at [CDP Portal](https://portal.cdp.coinbase.com/products/faucet)

---

## **11. Final Verification Checklist**

Before deploying, verify:

✅ **Packages**: All required packages installed correctly  
✅ **Provider**: `CDPReactProvider` wrapping app with proper config  
✅ **Client Directive**: All CDP components have `"use client"`  
✅ **Server Package**: Using `@coinbase/cdp-sdk` for server operations  
✅ **BigInt**: Using `BigInt()` constructor, not literals  
✅ **Environment**: Variables properly configured and secured  
✅ **CORS**: All domains configured in CDP Portal  
✅ **Security**: API keys never exposed client-side  
✅ **Authentication**: Proper error handling and loading states  
✅ **Testing**: Both authentication and transaction flows work  

---

**Remember**: CDP Embedded Wallets provide email-based authentication with true self-custody, eliminating seed phrases and browser extensions while maintaining user control over their assets through Coinbase's Trusted Execution Environment (TEE) infrastructure.
