# CryptoCoffee - Crypto Donation Platform

A decentralized "Buy Me a Coffee" clone that allows creators to accept cryptocurrency donations in any token across multiple blockchains. Built with Next.js, Dynamic.xyz SDK, and modern Web3 technologies.

## 🎯 Project Overview

CryptoCoffee enables anyone to create a personalized donation page where supporters can send crypto tips using any token in their wallet. The platform is completely non-custodial - donations go directly from supporter to creator without any intermediaries.

### Key Value Propositions

**For Creators:**
- ✅ Instant page creation with just wallet connection
- ✅ Accept any ERC-20 token across 6 major chains
- ✅ No KYC, no waiting periods, no custodial holds
- ✅ Direct wallet-to-wallet transfers
- ✅ Shareable personalized links

**For Supporters:**
- ✅ No signup required - just connect and donate
- ✅ Use any token already in their wallet
- ✅ Multi-chain support with automatic network switching
- ✅ Real-time balance and gas fee estimates
- ✅ On-chain proof of donation delivery

## 🏗️ Project Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 13 (App Router) + TypeScript | React framework with modern routing |
| **Web3 Integration** | Dynamic.xyz SDK + Wagmi + Viem | Wallet connection and blockchain interactions |
| **UI Components** | Shadcn/UI + Tailwind CSS | Beautiful, accessible component library |
| **State Management** | React Query + Wagmi hooks | Blockchain state and API caching |
| **Database** | In-memory (demo) / Supabase (production) | User profiles and metadata storage |

### Supported Blockchains
- Ethereum Mainnet
- Base
- Polygon
- Arbitrum
- Optimism
- BNB Smart Chain

## 📁 File Structure & Architecture

```
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Web3Provider
│   ├── page.tsx                 # Landing page with wallet auth
│   ├── onboarding/
│   │   └── page.tsx            # Profile creation after first login
│   ├── dashboard/
│   │   └── page.tsx            # Creator dashboard
│   ├── u/[slug]/
│   │   └── page.tsx            # Dynamic donation pages
│   └── api/                     # API routes
│       └── user/
│           ├── route.ts         # Create user endpoint
│           ├── [address]/route.ts # Get user by wallet address
│           └── slug/[slug]/route.ts # Get user by slug
├── components/
│   ├── web3-provider.tsx        # Dynamic.xyz + Wagmi configuration
│   ├── donation-page.tsx        # Public donation page component
│   └── enhanced-crypto-donate-modal.tsx # Advanced donation modal
├── scripts/
│   └── create-tables.sql        # Database schema
└── README.md                    # This file
```

## 🔧 Core Components Explained

### 1. Web3Provider (`components/web3-provider.tsx`)
**Purpose:** Root Web3 context provider that wraps the entire application.

**Key Features:**
- Configures Dynamic.xyz SDK with environment settings
- Sets up Wagmi with 6 supported blockchain networks
- Provides React Query client for caching
- Enables wallet connection across 300+ wallet types

**Configuration:**
- Uses `connect-only` auth mode (no signature required)
- Enables Shadow DOM for consistent styling
- Supports embedded wallets via Dynamic's MPC technology

### 2. Landing Page (`app/page.tsx`)
**Purpose:** Marketing page and entry point for wallet authentication.

**Key Features:**
- Hero section explaining the platform
- Feature showcase with benefits
- "How it works" section
- Integrated wallet connection modal
- Automatic user detection and routing

**User Flow:**
1. User clicks "Start My Page"
2. Dynamic widget opens for wallet connection
3. On successful connection, checks if user exists
4. Routes to onboarding (new user) or their donation page (existing)

### 3. Onboarding (`app/onboarding/page.tsx`)
**Purpose:** Profile creation for first-time users.

**Key Features:**
- Display name input with slug generation
- Optional bio field
- Real-time slug preview
- Automatic user creation via API

**Slug Generation Logic:**
- Converts display name to URL-friendly format
- Falls back to wallet address prefix if no name provided
- Ensures uniqueness across all users

### 4. Dynamic Donation Pages (`app/u/[slug]/page.tsx`)
**Purpose:** Server-side rendered public donation pages.

**Architecture:**
- Uses Next.js dynamic routing with `[slug]` parameter
- Server-side data fetching for SEO optimization
- 404 handling for non-existent users
- Passes user data to client-side donation component

### 5. Donation Page Component (`components/donation-page.tsx`)
**Purpose:** Client-side donation page with interactive elements.

**Key Features:**
- User profile display with avatar generation
- Wallet address verification links
- Copy/share functionality for page links
- Owner detection (shows different UI for page owner)
- Integration with donation modal

### 6. Enhanced Crypto Donate Modal (`components/enhanced-crypto-donate-modal.tsx`)
**Purpose:** Advanced donation interface with multi-chain token support.

**Core Functionality:**

#### Network Management
- Dropdown selection of 6 supported chains
- Automatic network switching prompts
- Real-time network validation

#### Dynamic Token Detection
```typescript
// Scans user's wallet for available tokens
const { data: tokenBalances } = useReadContracts({
  contracts: chainTokens.map(token => ({
    address: getAddress(token.address),
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
  }))
})
```

#### Transaction Handling
- Native token transfers via `useSendTransaction`
- ERC-20 transfers via `useWriteContract`
- Real-time transaction status tracking
- Success animations with explorer links

#### UX Enhancements
- Preset amount buttons (context-aware)
- Balance validation before transactions
- Gas fee warnings for ERC-20 tokens
- Loading states and error handling

### 7. Dashboard (`app/dashboard/page.tsx`)
**Purpose:** Creator management interface.

**Current Features:**
- Profile information display
- Quick link copying
- Public page access
- Logout functionality
- Placeholder for future analytics

### 8. API Routes (`app/api/user/`)
**Purpose:** Backend endpoints for user management.

#### POST `/api/user`
- Creates new user profiles
- Validates required fields
- Checks for duplicate addresses/slugs
- Returns created user data

#### GET `/api/user/[address]`
- Retrieves user by wallet address
- Used for authentication checks
- Returns 404 for non-existent users

#### GET `/api/user/slug/[slug]`
- Retrieves user by slug for public pages
- Enables server-side rendering
- Powers dynamic donation pages

## 🔄 User Journey Flows

### Creator Onboarding Flow
```
Landing Page → Connect Wallet → Onboarding → Profile Creation → Dashboard → Share Link
```

### Donation Flow
```
Visit Creator Page → Connect Wallet → Select Network → Choose Token → Enter Amount → Send Transaction → Success
```

### Authentication Flow
```
Dynamic Widget → Wallet Connection → Address Verification → User Lookup → Route to Appropriate Page
```

## 🔐 Security & Best Practices

### Non-Custodial Architecture
- Private keys never leave user devices
- Direct wallet-to-wallet transfers
- No intermediate fund holding
- Dynamic's MPC for embedded wallets

### Address Validation
- Checksum validation using Viem's `getAddress()`
- Consistent lowercase storage
- Duplicate prevention

### Transaction Safety
- Balance validation before sending
- Gas estimation and warnings
- Network validation
- Transaction receipt confirmation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Dynamic.xyz account and Environment ID

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
```

3. **Configure Dynamic.xyz:**
- Visit [Dynamic Dashboard](https://app.dynamic.xyz/dashboard/api)
- Copy your Environment ID
- Add to `.env.local`:
```
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_environment_id_here
```

4. **Run development server:**
```bash
npm run dev
```

### Database Setup (Optional)
For production, replace in-memory storage with a real database:

```bash
# Run the SQL schema
psql -d your_database -f scripts/create-tables.sql
```

## ✅ Implemented Features

### Core Functionality
- ✅ Wallet-based authentication (Dynamic.xyz)
- ✅ User profile creation and management
- ✅ Dynamic donation pages with custom slugs
- ✅ Multi-chain support (6 networks)
- ✅ Dynamic token detection from user wallets
- ✅ Native and ERC-20 token transfers
- ✅ Real-time transaction tracking
- ✅ Network switching automation
- ✅ Responsive design with Tailwind CSS

### User Experience
- ✅ One-click wallet connection
- ✅ Instant page creation
- ✅ Copy/share functionality
- ✅ Success animations and confirmations
- ✅ Error handling and user feedback
- ✅ Mobile-responsive design

### Developer Experience
- ✅ TypeScript throughout
- ✅ Modern React patterns (hooks, context)
- ✅ Modular component architecture
- ✅ API route organization
- ✅ Environment-based configuration

## 🚧 Still To Implement

### High Priority
- **Database Integration**: Replace in-memory storage with Supabase/PlanetScale
- **Profile Editing**: Allow users to update display names and bios
- **Avatar Uploads**: Custom profile pictures instead of generated ones
- **Email Notifications**: Optional email alerts for new donations

### Analytics & Insights
- **Donation Tracking**: Store and display donation history
- **Analytics Dashboard**: Views, donations, top supporters
- **Revenue Metrics**: USD conversion and totals
- **Export Functionality**: CSV downloads of donation data

### Social Features
- **Supporter Leaderboards**: Top donors with badges
- **Donation Comments**: Optional messages with donations
- **Social Sharing**: Pre-filled tweets and social posts
- **Supporter Profiles**: Optional donor recognition

### Advanced Features
- **Recurring Donations**: Subscription-style payments
- **Goal Setting**: Fundraising targets with progress bars
- **Custom Themes**: Personalized page styling
- **Embedded Widgets**: iFrame donation buttons for external sites

### Technical Enhancements
- **Smart Account Integration**: Gas sponsorship for donors
- **Fiat On-Ramp**: Stripe integration for non-crypto users
- **Cross-Chain Bridging**: Automatic token bridging
- **Advanced Token Support**: NFTs, multi-token bundles
- **Webhook System**: Real-time donation notifications

### Infrastructure
- **CDN Integration**: Optimized asset delivery
- **Caching Strategy**: Redis for improved performance
- **Rate Limiting**: API protection
- **Monitoring**: Error tracking and performance metrics
- **Testing Suite**: Unit and integration tests

## 🔧 Configuration Options

### Dynamic.xyz Settings
The platform can be customized through Dynamic's dashboard:
- Supported wallet types
- Network configurations
- Branding and styling
- Authentication flows

### Environment Variables
```bash
# Required
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id

# Optional
NEXT_PUBLIC_BASE_URL=https://your-domain.com
DATABASE_URL=your_database_connection_string
```

### Chain Configuration
Add or remove supported chains in `components/web3-provider.tsx`:
```typescript
const config = createConfig({
  chains: [mainnet, base, polygon, arbitrum, optimism, bsc],
  // Add new chains here
})
```

## 📊 Performance Considerations

### Optimization Strategies
- Server-side rendering for donation pages (SEO)
- React Query for blockchain data caching
- Lazy loading of wallet connection modal
- Optimistic UI updates for better UX

### Scalability Notes
- In-memory storage is demo-only (max ~1000 users)
- Database required for production scale
- Consider CDN for global performance
- Implement caching for frequently accessed data

## 🤝 Contributing

This project follows modern React and Web3 development patterns. Key areas for contribution:

1. **Database Migration**: Implement Supabase integration
2. **Testing**: Add comprehensive test coverage
3. **UI/UX**: Enhance mobile experience and accessibility
4. **Analytics**: Build comprehensive donation tracking
5. **Documentation**: Expand setup and deployment guides

## 📝 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Dynamic.xyz, Next.js, and modern Web3 technologies.**