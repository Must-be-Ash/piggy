# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server (runs on localhost:3000)
- `npm run build` - Build for production
- `npm run build:production` - Clean build for production (removes .next folder)
- `npm run build:vercel` - Build for Vercel deployment (skips env validation)
- `npm run start` - Start production server
- `npm run lint` - Run Next.js linter
- `npm run type-check` - Run TypeScript type checking without emitting files
- `npm run check` - Run both linting and type checking
- `npm run test:build` - Test production build locally

### Testing
This project doesn't have formal test scripts configured. Use `npm run test:build` to verify production builds work correctly.

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Web3**: Coinbase Developer Platform (CDP) for embedded wallets, x402 for gas-less payments
- **Blockchain**: Base Sepolia Testnet (chainId: 84532) - USDC-only payments
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Vercel

### Key Architecture Components

#### Database Models (`lib/models/`)
- **User.ts**: User profiles with wallet addresses, custom slugs, social links, and donation settings
- **Donation.ts**: Transaction records with full blockchain metadata, token information, and status tracking

#### Core Services (`lib/`)
- **mongodb.ts**: Database connection and configuration
- **cdp-utils.ts**: Coinbase Developer Platform utilities for EOA wallets and USDC transfers
- **cdp-auth.ts**: CDP authentication and wallet management
- **retry-utils.ts**: Retry logic utilities for handling transient failures

#### App Router Structure (`app/`)
- **page.tsx**: Landing page
- **dashboard/**: Creator dashboard for managing donation pages
- **onboarding/**: User setup flow
- **u/[slug]/**: Public donation pages (dynamic routes)
- **api/**: REST API endpoints for user/donation operations
  - **send-tip/**: x402 payment endpoint with verification and settlement
  - **create-user/**: User registration and onboarding
  - **get-user/**: Fetch user profile by address or slug
  - **onramp/**: USDC purchase integration (buy USDC with fiat)

#### Key Components (`components/`)
- **enhanced-donation-modal.tsx**: Main donation interface with USDC payment via x402
- **donation-page.tsx**: Public donation page display
- **web3-provider.tsx**: CDP (Coinbase Developer Platform) provider configuration

#### Hooks (`hooks/`)
- **use-cdp-authenticated-api.ts**: Hook for making authenticated API calls with CDP wallet signatures
- **use-toast.ts**: Toast notification hook (shadcn/ui)

### Important Implementation Details

#### x402 Payment Flow
The app uses x402 protocol for gas-less USDC payments on Base Sepolia:
1. User selects recipient via slug lookup (`/u/[slug]`)
2. User enters USDC amount in donation modal
3. Client creates viem wallet client from CDP embedded wallet
4. Payment wrapped with `wrapFetchWithPayment` from x402-fetch
5. API request triggers x402 flow:
   - First call returns 402 with payment requirements
   - x402-fetch automatically signs EIP-3009 payment authorization
   - Retry with X-PAYMENT header
   - Server verifies payment with CDP facilitator
   - Server settles payment on-chain (collects USDC before processing)
   - Donation saved to MongoDB
6. User receives confirmation (payment was gas-less!)

#### CDP Embedded Wallets
- Users can sign in with email (no external wallet needed)
- CDP creates EOA wallets on Base Sepolia
- Supports passkey authentication
- Automatic wallet creation on first sign-in

#### Environment Variables Required
See `.env.example` for the complete template. Key variables:

```bash
# Coinbase Developer Platform (CDP)
NEXT_PUBLIC_CDP_PROJECT_ID=your-cdp-project-id        # For embedded wallets
CDP_API_KEY_ID=your-cdp-api-key                       # Server-side operations
CDP_API_KEY_SECRET=your-cdp-api-secret                # Paymaster & x402 settlement

# Application
NEXT_PUBLIC_BASE_URL=your-URL                         # Required for API calls
NEXT_PUBLIC_USDC_BASE_CONTRACT=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Database
MONGODB_URI=your-mongodb-URI

# Optional
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token          # For profile pictures
```

**Important**: CDP credentials are required for x402 payment settlement. The facilitator uses CDP authentication to handle gas fees and execute USDC transfers on Base Sepolia.

#### Onramp Integration
The app integrates Coinbase Onramp for USDC purchases. See `onramp-rules.md` for detailed documentation. Key points:
- **Session Tokens**: Generated server-side with CDP API keys for secure authentication
- **Token Lifetime**: 5 minutes expiration, single-use only
- **Security**: Must include true client IP (extract from TCP layer, not HTTP headers)
- **CORS Protection**: Required for web-based clients - never use `Access-Control-Allow-Origin: *`
- **Implementation**: Use `/api/onramp/` endpoint to generate session tokens
- **URL Format**: `https://pay.coinbase.com/buy/select-asset?sessionToken=<token>&<params>`

### Development Notes
- **Package Manager**: Uses npm (despite presence of pnpm-lock.yaml)
- **TypeScript**: Configured with strict mode; path alias `@/*` maps to root directory
- **Build Configuration**: ESLint and TypeScript errors are ignored during builds (`ignoreDuringBuilds: true`) - use `npm run lint` and `npm run type-check` manually
- **Images**: Unoptimized for faster builds and deployment
- **Styling**: Tailwind CSS with custom theme, shadcn/ui components
- **Webpack Configuration**: Ignores React Native modules (`@react-native-async-storage`, `pino-pretty`)
- **API Routes**: All use proper error handling and validation
- **Database**: Indexes configured for optimal query performance
- **Wallet Integration**: CDP embedded wallets with email sign-in and passkey support
- **Payment Protocol**: x402 for gas-less USDC transfers on Base Sepolia testnet
- **Retry Logic**: Implemented in `lib/retry-utils.ts` for handling transient failures