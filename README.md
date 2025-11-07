# PiggyBanks

A LinkTree type platform that also has gas-less crypto donation/tipping available. Built with Coinbase Developer Platform's Embedded Wallet, Onramp and x402 protocol.

## Features

- 🔑 **Embedded Wallets**: Sign in with email using CDP embedded wallets (no external wallet needed)
- ⚡ **Gas-Less Payments**: Send USDC tips via x402 protocol with zero gas fees
- 💰 **USDC Only**: Simplified donation flow using USDC on Base Sepolia testnet
- 🏦 **Built-in Onramp**: Buy USDC directly with fiat currency
- 👤 **Custom Profiles**: Create personalized donation pages with custom slugs
- 📱 **Mobile Optimized**: Responsive design that works on all devices


'#EC9AA6' 🐷


## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Coinbase Developer Platform (CDP)
NEXT_PUBLIC_CDP_PROJECT_ID=your_cdp_project_id
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/PiggyBank

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_USDC_BASE_CONTRACT=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Optional: Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Getting Your API Keys

#### Coinbase Developer Platform (CDP)
1. Sign up at [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
2. Create a new project
3. Copy your Project ID and API credentials from the dashboard
4. CDP enables:
   - Embedded wallets with email sign-in
   - EOA wallet creation on Base Sepolia
   - x402 payment settlement for gas-less transactions

#### MongoDB
- For local development: Install MongoDB locally or use MongoDB Atlas
- For production: Use MongoDB Atlas or another hosted MongoDB service

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd piggy-bank
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### x402 Gas-Less Payment Flow

1. **Sign In**: Users sign in with email using CDP embedded wallets
2. **Get USDC**: Buy USDC with fiat using the built-in onramp (optional)
3. **Send Tip**: Select recipient and enter USDC amount
4. **x402 Magic**:
   - Client wraps fetch request with x402 payment handler
   - Server returns 402 Payment Required with x402 specs
   - x402-fetch automatically signs EIP-3009 payment authorization
   - Client retries with X-PAYMENT header
   - Server verifies and settles payment via CDP facilitator
   - Payment is gas-less for the user!
5. **Confirmation**: Donation is saved to MongoDB and user receives confirmation

### Network
- **Blockchain**: Base Sepolia Testnet (chainId: 84532)
- **Token**: USDC only (0x036CbD53842c5426634e7929541eC2318f3dCF7e)
- **Gas Fees**: Zero! x402 handles all gas payments

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components, Radix UI
- **Web3**: Coinbase Developer Platform (CDP) for embedded wallets
- **Payment Protocol**: x402 for gas-less USDC transfers
- **Blockchain**: Base Sepolia Testnet, Viem, Wagmi
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Vercel

## Project Structure

```
piggy-bank/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── send-tip/      # x402 payment endpoint
│   │   ├── create-user/   # User registration
│   │   ├── get-user/      # Fetch user profiles
│   │   ├── user/          # User operations and queries
│   │   ├── check-slug/    # Slug availability checker
│   │   ├── avatar/        # Avatar upload endpoint
│   │   ├── onramp/        # USDC purchase (buy-options, buy-quote)
│   │   └── donations/     # Donation webhooks
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Creator dashboard
│   ├── onboarding/        # User onboarding flow
│   └── u/[slug]/         # Public donation pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── enhanced-donation-modal.tsx  # Main donation interface with x402
│   ├── donation-page.tsx  # Public donation page display
│   └── web3-provider.tsx  # CDP provider configuration
├── lib/                   # Utilities and configurations
│   ├── models/           # MongoDB models (User, Donation)
│   ├── cdp-utils.ts      # CDP wallet utilities
│   ├── onramp-api.ts     # Onramp integration helpers
│   ├── mongodb.ts        # Database connection
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Key Features Explained

### CDP Embedded Wallets
- Users sign in with email (no external wallet required)
- CDP automatically creates EOA wallets on Base Sepolia
- Supports passkey authentication for security
- Wallet creation happens seamlessly on first sign-in

### x402 Payment Protocol
- **Gas-less transactions**: Users don't pay gas fees
- **EIP-3009**: Uses `transferWithAuthorization` for USDC transfers
- **Payment verification**: CDP facilitator verifies payment signatures
- **Settlement**: Server settles payments on-chain before processing
- **HTTP 402**: Standard payment-required flow with automatic retry

### Built-in USDC Onramp
- Buy USDC directly with fiat currency (credit/debit card)
- Integrated Coinbase onramp within the app
- Supports multiple countries and payment methods
- Instant funding for donations

## Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
npm run test:build       # Test production build locally
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Resources

- **Coinbase Developer Platform**: [Get your API keys](https://portal.cdp.coinbase.com/)
- **x402 Protocol**: [Learn more about gas-less payments](https://x402.org)

## License

This project is licensed under the MIT License. 