# x402 Payment Flow Documentation

## Overview

This document explains exactly how we successfully implement x402 gas-less payments on Base Sepolia testnet using the CDP facilitator for USDC transfers.

## Architecture

### Components

1. **Client (Frontend)**: Creates payment authorization using CDP embedded wallet
2. **x402-fetch**: Automatically handles 402 payment flow
3. **API Route**: Receives payment, verifies and settles
4. **CDP Facilitator**: Handles verification, settlement, and gas sponsorship
5. **Base Sepolia**: Blockchain where USDC transfer executes

### Technology Stack

- **Network**: Base Sepolia (chainId: 84532)
- **Token**: USDC at `YOUR_WALLET_ADDRESS`
- **Protocol**: x402 payment protocol
- **Facilitator**: Coinbase Developer Platform (CDP)
- **Wallet**: CDP Embedded Wallets
- **Payment Method**: EIP-3009 `transferWithAuthorization`

## Complete Payment Flow

### Step 1: User Initiates Payment (Client-Side)

**File**: `components/enhanced-donation-modal.tsx`

1. User enters USDC amount
2. Client looks up recipient by slug
3. Client creates viem wallet client from CDP embedded wallet
4. Client wraps fetch with `wrapFetchWithPayment` from `x402-fetch`

```typescript
import { wrapFetchWithPayment } from "x402-fetch"

const walletClient = createWalletClient({
  account: address,
  chain: baseSepolia,
  transport: custom(cdpWalletProvider)
})

const paymentEnabledFetch = wrapFetchWithPayment(fetch, walletClient)
```

### Step 2: Initial API Request (No Payment)

**Client sends**:
```http
POST /api/send-tip
Content-Type: application/json

{
  "recipientSlug": "recipient-username",
  "amount": "1",
  "senderAddress": "0xSENDER_ADDRESS",
  "message": "Great work!"
}
```

**Server responds with 402**:
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "1000000",
    "resource": "http://localhost:3000/api/send-tip",
    "description": "Tip 1 USDC to recipient-username",
    "mimeType": "application/json",
    "payTo": "0xRECIPIENT_ADDRESS",
    "maxTimeoutSeconds": 60,
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "extra": { "name": "USDC", "version": "2" }
  }]
}
```

### Step 3: x402-fetch Creates Payment Authorization

**Automatic process** (handled by `x402-fetch`):

1. **Parses 402 response** to extract payment requirements
2. **Generates nonce**: Random 32-byte value for EIP-3009
3. **Sets validity window**:
   - `validAfter`: Current timestamp
   - `validBefore`: Current timestamp + 660 seconds (11 minutes)
4. **Creates EIP-712 typed data**:
   ```typescript
   {
     domain: {
       name: "USDC",
       version: "2",
       chainId: 84532,
       verifyingContract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
     },
     types: {
       TransferWithAuthorization: [
         { name: "from", type: "address" },
         { name: "to", type: "address" },
         { name: "value", type: "uint256" },
         { name: "validAfter", type: "uint256" },
         { name: "validBefore", type: "uint256" },
         { name: "nonce", type: "bytes32" }
       ]
     },
     message: {
       from: "0xSENDER_ADDRESS",
       to: "0xRECIPIENT_ADDRESS",
       value: "1000000",
       validAfter: "1700000000",
       validBefore: "1700000660",
       nonce: "0xRANDOM_32_BYTE_NONCE"
     }
   }
   ```
5. **Signs with wallet**: User's CDP wallet signs the typed data
6. **Creates payment payload**:
   ```json
   {
     "x402Version": 1,
     "scheme": "exact",
     "network": "base-sepolia",
     "payload": {
       "signature": "0xSIGNATURE_BYTES",
       "authorization": {
         "from": "0xSENDER_ADDRESS",
         "to": "0xRECIPIENT_ADDRESS",
         "value": "1000000",
         "validAfter": "1700000000",
         "validBefore": "1700000660",
         "nonce": "0xRANDOM_32_BYTE_NONCE"
       }
     }
   }
   ```
7. **Encodes to base64**: `btoa(JSON.stringify(paymentPayload))`

### Step 4: Retry Request With Payment

**Client sends**:
```http
POST /api/send-tip
Content-Type: application/json
X-PAYMENT: BASE64_ENCODED_PAYMENT_PAYLOAD

{
  "recipientSlug": "recipient-username",
  "amount": "1",
  "senderAddress": "0xSENDER_ADDRESS",
  "message": "Great work!"
}
```

### Step 5: Server Verifies Payment

**File**: `app/api/send-tip/route.ts` (lines 102-135)

1. **Decode X-PAYMENT header**:
   ```typescript
   const decoded = Buffer.from(paymentHeader, "base64").toString("utf-8")
   const paymentPayload = JSON.parse(decoded)
   ```

2. **Call CDP facilitator for verification**:
   ```typescript
   const verifyResult = await verifyPayment(paymentPayload, paymentRequirements)
   ```

3. **Facilitator verifies**:
   - Checks signature matches authorization
   - Validates EIP-712 domain matches USDC contract
   - Ensures `from`, `to`, `value` match requirements
   - Checks `validAfter` and `validBefore` timestamps
   - Verifies nonce hasn't been used

4. **Returns verification result**:
   ```json
   {
     "isValid": true,
     "payer": "0xSENDER_ADDRESS"
   }
   ```

### Step 6: Server Settles Payment

**File**: `app/api/send-tip/route.ts` (lines 137-200)

This is where the actual USDC transfer happens!

1. **Call CDP facilitator for settlement**:
   ```typescript
   const settlementResult = await settlePayment(paymentPayload, paymentRequirements)
   ```

2. **CDP Facilitator executes settlement**:

   **What the facilitator does (automatically)**:

   a. **Validates payment authorization again** (server-side checks)

   b. **Constructs blockchain transaction**:
      - Calls USDC contract's `transferWithAuthorization` function
      - Parameters from the authorization:
        ```solidity
        function transferWithAuthorization(
          address from,     // 0xSENDER_ADDRESS
          address to,       // 0xRECIPIENT_ADDRESS
          uint256 value,    // 1000000 (1 USDC)
          uint256 validAfter,
          uint256 validBefore,
          bytes32 nonce,
          bytes memory signature
        )
        ```

   c. **Sponsors gas fees**:
      - Facilitator pays for gas (not the user!)
      - This is the "gas-less" part of x402

   d. **Submits transaction to Base Sepolia**:
      - Transaction is broadcast to the blockchain
      - USDC contract verifies the signature on-chain
      - If valid, transfers USDC from sender to recipient

   e. **Waits for confirmation**:
      - Monitors transaction status
      - Returns once transaction is confirmed

3. **Facilitator returns settlement result**:
   ```json
   {
     "success": true,
     "transaction": "0xTRANSACTION_HASH",
     "network": "base-sepolia",
     "payer": "0xSENDER_ADDRESS"
   }
   ```

### Step 7: Server Saves Donation Record

**File**: `app/api/send-tip/route.ts` (lines 202-213)

```typescript
const donation = new Donation({
  txHash: settlementResult.transaction,
  chainId: 84532,
  fromAddress: senderAddress.toLowerCase(),
  toAddress: recipientAddress.toLowerCase(),
  tokenAddress: USDC_BASE.toLowerCase(),
  tokenSymbol: "USDC",
  tokenDecimals: 6,
  amountRaw: maxAmountRequired,
  amountFormatted: amount,
  message: message || "",
  status: "confirmed",
  transactionTimestamp: new Date(),
})

await donation.save()
```

### Step 8: Server Returns Success

**Server responds with 200**:
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-PAYMENT-RESPONSE: BASE64_ENCODED_PAYMENT_RESPONSE

{
  "success": true,
  "donation": {
    "id": "MONGODB_DOCUMENT_ID",
    "amount": "1",
    "recipient": "recipient-username"
  }
}
```

**X-PAYMENT-RESPONSE header** (base64 decoded):
```json
{
  "success": true,
  "transaction": "0xTRANSACTION_HASH",
  "network": "base-sepolia",
  "payer": "0xSENDER_ADDRESS",
  "amount": "1000000",
  "token": "USDC",
  "recipient": "0xRECIPIENT_ADDRESS"
}
```

## Critical Configuration Details

### CDP Facilitator Configuration

**File**: `app/api/send-tip/route.ts` (lines 2-22)

```typescript
import { createFacilitatorConfig } from "@coinbase/x402"
import { useFacilitator } from "x402/verify"

// Validate CDP credentials
if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
  throw new Error("CDP credentials missing")
}

// Initialize facilitator with explicit credentials
const facilitator = createFacilitatorConfig(
  process.env.CDP_API_KEY_ID,
  process.env.CDP_API_KEY_SECRET
)

const { verify: verifyPayment, settle: settlePayment } = useFacilitator(facilitator)
```

**Why explicit credentials?**
- Guarantees CDP API keys are passed to the facilitator
- Enables settlement authentication with CDP
- Without this, settlement would fail with 400/401 errors

### Payment Requirements Configuration

**File**: `app/api/send-tip/route.ts` (lines 64-76)

```typescript
const paymentRequirements = {
  scheme: "exact" as const,
  network: "base-sepolia" as const,
  maxAmountRequired: "1000000",  // Amount in atomic units (1 USDC = 1,000,000)
  resource: request.url,
  description: `Tip ${amount} USDC to ${recipient.displayName || recipientSlug}`,
  mimeType: "application/json",
  payTo: recipientAddress,       // Recipient's wallet address
  maxTimeoutSeconds: 60,
  asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",  // USDC contract on Base Sepolia
  extra: { name: "USDC", version: "2" }  // ⚠️ CRITICAL: Must match contract's EIP-712 domain
}
```

### EIP-712 Domain Parameters (CRITICAL)

**Why `extra: { name: "USDC", version: "2" }` is critical:**

1. **USDC Contract Type**: Base Sepolia USDC is FiatTokenV2_2
2. **EIP-712 Domain**: Contract defines domain with `name="USDC"` and `version="2"`
3. **Signature Validation**: On-chain signature verification uses this domain
4. **Mismatch = Failure**: Wrong version causes signature validation to fail

**How to verify:**
```bash
# Query USDC contract on Base Sepolia
cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e "name()" --rpc-url https://sepolia.base.org
# Returns: "USDC"

cast call 0x036CbD53842c5426634e7929541eC2318f3dCF7e "version()" --rpc-url https://sepolia.base.org
# Returns: "2"
```

## Environment Variables Required

```bash
# CDP Authentication (required for facilitator)
CDP_API_KEY_ID=your-cdp-api-key-id
CDP_API_KEY_SECRET=your-cdp-api-key-secret

# CDP Project (required for embedded wallets)
NEXT_PUBLIC_CDP_PROJECT_ID=your-cdp-project-id

# Database
MONGODB_URI=mongodb+srv://your-connection-string

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## How Settlement Works (Behind the Scenes)

### What the CDP Facilitator Does

1. **Receives settlement request** with payment payload and requirements
2. **Authenticates request** using CDP API keys (JWT token)
3. **Validates payment authorization**:
   - Checks signature is valid for the given authorization
   - Verifies EIP-712 domain matches the token contract
   - Ensures amounts and addresses match requirements
4. **Constructs blockchain transaction**:
   - Calls `transferWithAuthorization` on USDC contract
   - Includes all authorization parameters + signature
5. **Pays for gas**:
   - Uses CDP's gas sponsorship service
   - User pays $0 in gas fees
6. **Submits to Base Sepolia**:
   - Broadcasts transaction to network
   - Monitors for confirmation
7. **Returns transaction hash** once confirmed

### On-Chain Execution

The USDC contract's `transferWithAuthorization` function:

```solidity
function transferWithAuthorization(
    address from,
    address to,
    uint256 value,
    uint256 validAfter,
    uint256 validBefore,
    bytes32 nonce,
    bytes memory signature
) external {
    // 1. Check timestamp is valid
    require(block.timestamp > validAfter, "Authorization not yet valid");
    require(block.timestamp < validBefore, "Authorization expired");

    // 2. Check nonce hasn't been used
    require(!_authorizationStates[from][nonce], "Authorization already used");

    // 3. Recover signer from signature
    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        DOMAIN_SEPARATOR,  // Uses name="USDC", version="2"
        keccak256(abi.encode(
            TRANSFER_WITH_AUTHORIZATION_TYPEHASH,
            from,
            to,
            value,
            validAfter,
            validBefore,
            nonce
        ))
    ));
    address signer = ECDSA.recover(digest, signature);

    // 4. Verify signer is 'from' address
    require(signer == from, "Invalid signature");

    // 5. Mark nonce as used
    _authorizationStates[from][nonce] = true;

    // 6. Execute transfer
    _transfer(from, to, value);
}
```

**Key points:**
- Transaction is called by the **facilitator**, not the user
- User's signature proves they authorized the transfer
- Nonce prevents replay attacks
- `from` address pays the USDC, facilitator pays the gas

## Troubleshooting

### Common Issues and Solutions

#### 400 Bad Request on Settlement

**Symptoms**: Verification succeeds, settlement fails with 400

**Causes**:
1. ❌ Wrong EIP-712 domain version → Fix: Use version "2" for USDC
2. ❌ Wrong EIP-712 domain name → Fix: Use "USDC" not "USD Coin"
3. ❌ Missing CDP credentials → Fix: Ensure `CDP_API_KEY_ID` and `CDP_API_KEY_SECRET` are set
4. ❌ Wrong USDC contract address → Fix: Use `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

#### 401 Unauthorized on Settlement

**Symptoms**: Settlement fails with 401

**Causes**:
1. ❌ CDP credentials not passed to facilitator → Fix: Use `createFacilitatorConfig(apiKeyId, apiKeySecret)`
2. ❌ Invalid CDP API keys → Fix: Generate new keys from CDP dashboard

#### Verification Fails

**Symptoms**: Payment verification returns `isValid: false`

**Causes**:
1. ❌ Signature doesn't match authorization → Check EIP-712 domain in client
2. ❌ Amounts don't match → Ensure `value` matches `maxAmountRequired`
3. ❌ Expired authorization → Check `validBefore` timestamp

## Summary

The x402 payment flow successfully works by:

1. ✅ **Client** creates EIP-3009 authorization with correct EIP-712 domain
2. ✅ **x402-fetch** wraps the authorization in X-PAYMENT header
3. ✅ **Server** verifies authorization via CDP facilitator
4. ✅ **CDP Facilitator** settles payment on-chain with gas sponsorship
5. ✅ **USDC Contract** validates signature and executes transfer
6. ✅ **Server** saves donation record and returns success

**Critical success factors:**
- Correct EIP-712 domain: `{ name: "USDC", version: "2" }`
- Explicit CDP credentials: `createFacilitatorConfig(apiKeyId, apiKeySecret)`
- Valid USDC contract address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Proper payment requirements structure
- Gas sponsorship by CDP facilitator

**Result**: Users can send USDC tips without paying any gas fees, and recipients receive USDC directly to their wallets on Base Sepolia testnet.
