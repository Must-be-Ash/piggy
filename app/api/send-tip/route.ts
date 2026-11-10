import { NextRequest, NextResponse } from "next/server"
import { createFacilitatorConfig } from "@coinbase/x402"
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server"
import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader,
} from "@x402/core/http"
import type { PaymentPayload } from "@x402/core/types"
import { ExactEvmScheme } from "@x402/evm/exact/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Donation from "@/lib/models/Donation"
import { USDC_BASE_ADDRESS, USDC_DECIMALS } from "@/lib/cdp-utils"

// Validate CDP credentials are present for settlement operations
if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
  throw new Error("CDP credentials missing: Set CDP_API_KEY_ID and CDP_API_KEY_SECRET in .env")
}

// Initialize CDP facilitator with explicit credentials for payment verification and settlement
// Settlement requires authentication, so we pass credentials explicitly to ensure they're available
// This handles gas fees and executes the USDC transfer on-chain via CDP's x402 facilitator
const facilitator = createFacilitatorConfig(
  process.env.CDP_API_KEY_ID,
  process.env.CDP_API_KEY_SECRET
)
const NETWORK = "eip155:84532" // Base Sepolia (CAIP-2)
const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient(facilitator))
  .register(NETWORK, new ExactEvmScheme())

let initPromise: Promise<void> | null = null
function ensureInitialized() {
  initPromise ??= resourceServer.initialize().catch((error) => {
    initPromise = null
    throw error
  })
  return initPromise
}

// USDC contract on Base Sepolia testnet
const USDC_BASE = USDC_BASE_ADDRESS as `0x${string}`

export async function POST(request: NextRequest) {
  try {
    // Parse request body to get tip details
    const body = await request.json()
    const { recipientSlug, amount, message, senderAddress } = body

    if (!recipientSlug || !amount || !senderAddress) {
      return NextResponse.json(
        { error: "Missing required fields: recipientSlug, amount, senderAddress" },
        { status: 400 }
      )
    }

    // Look up recipient user from database
    await connectDB()
    const recipient = await User.findOne({ slug: recipientSlug.toLowerCase() })

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      )
    }

    const recipientAddress = recipient.address as `0x${string}`

    // Calculate amount in smallest units (USDC has 6 decimals)
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    const maxAmountRequired = (amountNum * 10 ** USDC_DECIMALS).toString()

    // Define payment requirements for x402 v2
    await ensureInitialized()
    const [paymentRequirements] = await resourceServer.buildPaymentRequirements({
      scheme: "exact",
      network: NETWORK,
      price: {
        amount: maxAmountRequired,
        asset: USDC_BASE,
        extra: { name: "USDC", version: "2" }, // Base Sepolia USDC uses FiatTokenV2_2 with version "2"
      },
      payTo: recipientAddress,
      maxTimeoutSeconds: 60,
    })
    const resource = {
      url: request.url,
      description: `Tip ${amount} USDC to ${recipient.displayName || recipientSlug}`,
      mimeType: "application/json",
    }

    // 1. Check for payment header first (v2 PAYMENT-SIGNATURE, legacy X-PAYMENT name also accepted)
    const paymentHeader = request.headers.get("PAYMENT-SIGNATURE") ?? request.headers.get("X-PAYMENT")

    if (!paymentHeader) {
      console.log("[x402] No payment header - returning 402")
      // Return 402 with payment requirements (body + PAYMENT-REQUIRED header)
      const paymentRequired = await resourceServer.createPaymentRequiredResponse(
        [paymentRequirements],
        resource,
        "PAYMENT-SIGNATURE header is required"
      )
      return NextResponse.json(paymentRequired, {
        status: 402,
        headers: {
          "PAYMENT-REQUIRED": encodePaymentRequiredHeader(paymentRequired),
          "Access-Control-Expose-Headers": "PAYMENT-REQUIRED, PAYMENT-RESPONSE",
        },
      })
    }

    // 2. Decode and verify payment
    console.log("[x402] Decoding payment header...")
    let paymentPayload: PaymentPayload
    try {
      paymentPayload = decodePaymentSignatureHeader(paymentHeader)
      console.log("[x402] Payment payload decoded:", JSON.stringify(paymentPayload, null, 2))
    } catch (err) {
      console.error("[x402] Failed to decode payment:", err)
      return NextResponse.json(
        { error: "Invalid PAYMENT-SIGNATURE header format" },
        { status: 402 }
      )
    }

    if (!resourceServer.findMatchingRequirements([paymentRequirements], paymentPayload)) {
      return NextResponse.json(
        { error: "Payment does not match the payment requirements" },
        { status: 402 }
      )
    }

    console.log("[x402] Verifying payment with CDP facilitator...")
    console.log("[x402] Payment requirements:", JSON.stringify(paymentRequirements, null, 2))

    try {
      const verifyResult = await resourceServer.verifyPayment(paymentPayload, paymentRequirements)
      console.log("[x402] Verification result:", JSON.stringify(verifyResult, null, 2))

      if (!verifyResult.isValid) {
        console.error("[x402] Payment verification failed:", verifyResult.invalidReason)
        return NextResponse.json(
          {
            error: "Payment verification failed",
            reason: verifyResult.invalidReason
          },
          { status: 402 }
        )
      }

      console.log("[x402] Payment verified successfully for payer:", verifyResult.payer)
    } catch (error) {
      console.error("[x402] Verification error:", error)
      return NextResponse.json(
        { error: "Payment verification failed", details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }

    // 3. Settle payment BEFORE processing (collect money first!)
    console.log("[x402] Settling payment...")
    console.log("[x402] === SETTLEMENT REQUEST DEBUG ===")
    console.log("[x402] Payment Payload:", JSON.stringify(paymentPayload, null, 2))
    console.log("[x402] Payment Requirements:", JSON.stringify(paymentRequirements, null, 2))
    console.log("[x402] CDP Credentials Check:", {
      hasApiKeyId: !!process.env.CDP_API_KEY_ID,
      apiKeyIdLength: process.env.CDP_API_KEY_ID?.length || 0,
      hasApiKeySecret: !!process.env.CDP_API_KEY_SECRET,
      apiKeySecretLength: process.env.CDP_API_KEY_SECRET?.length || 0
    })
    console.log("[x402] === END DEBUG ===")

    let settlementResult
    try {
      settlementResult = await resourceServer.settlePayment(paymentPayload, paymentRequirements)
      console.log("[x402] Settlement result:", JSON.stringify(settlementResult, null, 2))

      if (!settlementResult.success) {
        console.error("[x402] ❌ Settlement failed:", settlementResult.errorReason)
        return NextResponse.json(
          {
            error: "Payment settlement failed",
            reason: settlementResult.errorReason
          },
          { status: 402 }
        )
      }

      console.log("[x402] ✅ Payment settled successfully!")
      console.log("[x402] Transaction:", settlementResult.transaction)
      console.log("[x402] Network:", settlementResult.network)
      console.log("[x402] Payer:", settlementResult.payer)
    } catch (error) {
      console.error("[x402] === SETTLEMENT ERROR DETAILS ===")
      console.error("[x402] Error type:", error instanceof Error ? error.constructor.name : typeof error)
      console.error("[x402] Error message:", error instanceof Error ? error.message : String(error))

      if (error instanceof Error) {
        console.error("[x402] Error stack:", error.stack)
      }

      // Try to extract any additional error properties
      if (error && typeof error === 'object') {
        const errorObj = error as Record<string, unknown>
        const relevantProps = ['response', 'data', 'status', 'statusCode', 'body', 'cause']
        relevantProps.forEach(prop => {
          if (prop in errorObj && errorObj[prop] !== undefined) {
            console.error(`[x402] Error.${prop}:`, errorObj[prop])
          }
        })
      }

      console.error("[x402] === END ERROR DETAILS ===")

      return NextResponse.json(
        {
          error: "Payment settlement failed",
          details: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.constructor.name : typeof error
        },
        { status: 402 }
      )
    }

    // Payment successful! Now save donation to database
    const donation = new Donation({
      txHash: settlementResult.transaction || `x402-${Date.now()}`,
      chainId: 84532, // Base Sepolia
      fromAddress: senderAddress.toLowerCase(),
      toAddress: recipientAddress.toLowerCase(),
      tokenAddress: USDC_BASE.toLowerCase(),
      tokenSymbol: "USDC",
      tokenDecimals: USDC_DECIMALS,
      amountRaw: maxAmountRequired,
      amountFormatted: amount,
      message: message || "",
      isAnonymous: false,
      status: "confirmed",
      confirmations: 1,
      transactionTimestamp: new Date(),
    })

    await donation.save()

    console.log("[x402] Donation saved to database:", donation._id)

    // 4. Return success response with payment receipt (payment already settled)
    return NextResponse.json(
      {
        success: true,
        donation: {
          id: donation._id,
          amount,
          recipient: recipient.displayName || recipientSlug,
        }
      },
      {
        headers: {
          "PAYMENT-RESPONSE": encodePaymentResponseHeader(settlementResult),
          "Access-Control-Expose-Headers": "PAYMENT-RESPONSE",
        }
      }
    )

  } catch (error) {
    console.error("Send tip error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
