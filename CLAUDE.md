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
- `npm run test:build` - Test production build locally

### Testing
This project doesn't have formal test scripts configured. Use `npm run test:build` to verify production builds work correctly.

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Web3**: Dynamic Labs for wallet connection, Wagmi v2 for blockchain interactions
- **Database**: MongoDB with Mongoose ODM
- **Token Detection**: Alchemy API for dynamic token discovery
- **Deployment**: Vercel

### Key Architecture Components

#### Database Models (`lib/models/`)
- **User.ts**: User profiles with wallet addresses, custom slugs, social links, and donation settings
- **Donation.ts**: Transaction records with full blockchain metadata, token information, and status tracking

#### Core Services (`lib/`)
- **token-detection.ts**: Comprehensive token detection using Alchemy API
  - Detects ALL tokens in user wallets (including unknown/custom tokens)
  - Fetches metadata, logos, and balances
  - Supports major chains: Ethereum, Base, Polygon, Arbitrum, Optimism, BSC
- **price-service.ts**: Token price fetching and USD conversion
- **mongodb.ts**: Database connection and configuration
- **wallet-auth.ts**: Wallet-based authentication utilities

#### Multi-Chain Support
Supports donation flows across multiple EVM chains:
- Ethereum Mainnet (chainId: 1)
- Base (chainId: 8453)
- Polygon (chainId: 137)
- Arbitrum (chainId: 42161)
- Optimism (chainId: 10)
- BSC (chainId: 56)

#### App Router Structure (`app/`)
- **page.tsx**: Landing page
- **dashboard/**: Creator dashboard for managing donation pages
- **onboarding/**: User setup flow
- **u/[slug]/**: Public donation pages (dynamic routes)
- **api/**: REST API endpoints for user/donation operations

#### Key Components (`components/`)
- **enhanced-donation-modal.tsx**: Main donation interface with token selection and transaction handling
- **auth-modal.tsx**: Wallet connection modal
- **donation-page.tsx**: Public donation page display
- **web3-provider.tsx**: Wagmi configuration and provider setup

### Important Implementation Details

#### Token Detection Flow
1. Uses Alchemy's `alchemy_getTokenBalances` to get ALL ERC-20 tokens
2. Filters for non-zero balances
3. Batch fetches metadata via `alchemy_getTokenMetadata`
4. Enhances with token list data for logos
5. Includes native token balances via Wagmi hooks

#### Donation Flow
1. User selects recipient via slug lookup
2. Dynamic token detection shows all available tokens
3. User selects token and amount with real-time balance validation
4. Transaction submitted via Wagmi with proper gas estimation
5. Transaction tracked and stored in database with full metadata

#### Environment Variables Required
```bash
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
MONGODB_URI=mongodb://localhost:27017/PiggyBank
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Development Notes
- Uses pnpm for package management (has pnpm-lock.yaml)
- TypeScript configured with strict mode
- Tailwind CSS for styling with custom theme
- All API routes use proper error handling and validation
- Database uses indexes for optimal query performance
- Wallet connection via Dynamic Labs with Wagmi integration