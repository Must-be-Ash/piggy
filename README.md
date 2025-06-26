# PiggyBack

A crypto donation platform built with Next.js, Dynamic Labs, and MongoDB.

## Features

- 🔗 **Wallet Connection**: Connect using any EVM wallet via Dynamic Labs
- 💰 **Multi-Chain Support**: Ethereum, Base, Polygon, Arbitrum, Optimism, BSC, and more
- 🎯 **Dynamic Token Detection**: Automatically detects ALL tokens in your wallet using Alchemy API
- 💳 **Smart Donations**: Send any token you own with real-time balance validation
- 👤 **Custom Profiles**: Create personalized donation pages with custom slugs
- 📱 **Mobile Optimized**: Responsive design that works on all devices

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Dynamic Labs Configuration
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/PiggyBack

# Alchemy Configuration (for dynamic token detection)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Base URL for production deployments
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Getting Your API Keys

#### Dynamic Labs
1. Sign up at [Dynamic Labs](https://app.dynamic.xyz/)
2. Create a new project
3. Copy your Environment ID from the dashboard

#### Alchemy (Required for Token Detection)
1. Sign up at [Alchemy](https://www.alchemy.com/)
2. Create a new app
3. Copy your API key
4. This enables automatic detection of ALL tokens in user wallets across supported chains

#### MongoDB
- For local development: Install MongoDB locally or use MongoDB Atlas
- For production: Use MongoDB Atlas or another hosted MongoDB service

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-coffee
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

## Dynamic Token Detection

The platform now automatically detects ALL tokens in a user's wallet using Alchemy's API, including:

- **Native tokens** (ETH, MATIC, BNB, etc.)
- **Popular ERC-20 tokens** (USDC, USDT, DAI, WBTC, etc.)
- **Custom/Unknown tokens** (like Poopcoin, Pog Coin, etc.)
- **Token metadata** (names, symbols, decimals, logos)

This means users can donate with ANY token they own, not just pre-configured ones!

### Supported Chains for Token Detection
- Ethereum Mainnet
- Base
- Polygon
- Arbitrum
- Optimism
- BNB Smart Chain

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Wallet**: Dynamic Labs, Wagmi, Viem
- **Database**: MongoDB with Mongoose
- **Token Detection**: Alchemy API
- **Deployment**: Vercel

## Project Structure

```
crypto-coffee/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Creator dashboard
│   ├── onboarding/        # User onboarding
│   └── u/[slug]/         # Public donation pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── enhanced-donation-modal.tsx  # Main donation interface
├── lib/                   # Utilities and configurations
│   ├── models/           # Database models
│   ├── token-detection.ts # Dynamic token detection service
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 