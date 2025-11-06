import { NextRequest, NextResponse } from "next/server"
import { CdpClient } from "@coinbase/cdp-sdk"
import { generateJwt } from "@coinbase/cdp-sdk/auth"

// TypeScript interfaces for CDP objects
export interface CDPAuthMethod {
  type: string
  email?: string
}

export interface CDPUser {
  userId: string
  email?: string
  authenticationMethods?: CDPAuthMethod[]
  evmSmartAccounts: string[]
  evmAccounts: string[]
  solanaAccounts: string[]
}

export interface CDPCredentials {
  apiKeyId: string
  apiKeySecret: string
}

export interface CDPAuthConfig {
  requestMethod: string
  requestHost: string
  requestPath: string
  audience?: string[]
}

// Onramp API constants
export const ONRAMP_API_BASE_URL = "https://api.developer.coinbase.com"

// Initialize CDP client ONCE for server-side validation
let cdpClient: CdpClient | null = null

function getCdpClient(): CdpClient {
  if (!cdpClient) {
    const apiKeyId = process.env.CDP_API_KEY_ID
    const apiKeySecret = process.env.CDP_API_KEY_SECRET

    if (!apiKeyId || !apiKeySecret) {
      throw new Error("CDP_API_KEY_ID and CDP_API_KEY_SECRET must be set")
    }

    cdpClient = new CdpClient({
      apiKeyId,
      apiKeySecret,
    })
  }

  return cdpClient
}

/**
 * Gets CDP API credentials from environment variables
 * Used for Onramp API authentication
 */
export function getCDPCredentials(): CDPCredentials {
  const apiKeyId = process.env.CDP_API_KEY_ID
  const apiKeySecret = process.env.CDP_API_KEY_SECRET

  if (!apiKeyId || !apiKeySecret) {
    throw new Error("CDP_API_KEY_ID and CDP_API_KEY_SECRET must be set")
  }

  return { apiKeyId, apiKeySecret }
}

/**
 * Generates JWT token for Onramp API requests
 * Used for server-to-server authentication with Coinbase Onramp API
 */
export async function generateCDPJWT(config: CDPAuthConfig): Promise<string> {
  const credentials = getCDPCredentials()

  return await generateJwt({
    apiKeyId: credentials.apiKeyId,
    apiKeySecret: credentials.apiKeySecret,
    requestMethod: config.requestMethod,
    requestHost: config.requestHost,
    requestPath: config.requestPath,
    audience: config.audience,
  })
}

/**
 * Validates CDP access token from Authorization header
 * Returns authenticated user information or error
 */
export async function validateCDPAuth(request: NextRequest): Promise<{
  user: CDPUser | null
  error: string | null
  status: number
}> {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        user: null,
        error: "Invalid or missing Authorization header",
        status: 401,
      }
    }

    const accessToken = authHeader.replace("Bearer ", "").trim()

    // CDP validates the token for you
    const client = getCdpClient()
    const endUser = await client.endUser.validateAccessToken({
      accessToken,
    })

    return {
      user: endUser as unknown as CDPUser,
      error: null,
      status: 200,
    }
  } catch (error) {
    console.error("CDP authentication error:", error)

    return {
      user: null,
      error: `Invalid or expired access token`,
      status: 401,
    }
  }
}

/**
 * Higher-order function to protect API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: CDPUser) => Promise<Response>
): Promise<Response> {
  const authResult = await validateCDPAuth(request)

  if (authResult.error || !authResult.user) {
    return NextResponse.json(
      { error: authResult.error || "Authentication failed" },
      { status: authResult.status || 401 }
    )
  }

  return handler(request, authResult.user)
}

// Utility to extract userId from CDP user object
export function extractUserIdFromCDPUser(user: CDPUser): string | null {
  try {
    return user?.userId ? String(user.userId) : null
  } catch {
    return null
  }
}

// Utility to extract email from CDP user object
export function extractEmailFromCDPUser(user: CDPUser): string | null {
  try {
    const authMethods = user?.authenticationMethods
    if (Array.isArray(authMethods)) {
      const emailMethod = authMethods.find((method) => method.type === "email")
      if (emailMethod?.email) {
        return String(emailMethod.email).toLowerCase()
      }
    }

    if (user?.email) {
      return String(user.email).toLowerCase()
    }

    return null
  } catch (error) {
    console.error("Error extracting email:", error)
    return null
  }
}

// Utility to extract EVM addresses from CDP user object
export function extractEvmAddressesFromCDPUser(user: CDPUser): string[] {
  try {
    const addresses: string[] = []

    // evmAccounts are already strings (addresses)
    if (user?.evmAccounts && Array.isArray(user.evmAccounts)) {
      addresses.push(...user.evmAccounts.map(addr => addr.toLowerCase()))
    }

    return addresses
  } catch (error) {
    console.error("Error extracting EVM addresses:", error)
    return []
  }
}
