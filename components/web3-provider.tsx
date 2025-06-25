"use client"

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core"
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector"
import { createConfig, WagmiProvider } from "wagmi"
import { http, defineChain } from "viem"
import { 
  mainnet, 
  base, 
  polygon, 
  arbitrum, 
  optimism, 
  bsc,
  avalanche,
  fantom,
  gnosis,
  celo,
  linea,
  scroll,
  zksync,
  polygonZkEvm,
  mantle,
  blast,
  metis,
  opBNB
} from "viem/chains"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type React from "react"

// Define custom chains that aren't in viem yet
const worldChain = defineChain({
  id: 480,
  name: 'World Chain',
  network: 'worldchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'WorldScan', url: 'https://worldscan.org' }
  }
})

const shape = defineChain({
  id: 360,
  name: 'Shape',
  network: 'shape',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://shape-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://shape-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'ShapeExplorer', url: 'https://explorer.shape.network' }
  }
})

const berachain = defineChain({
  id: 80085,
  name: 'Berachain',
  network: 'berachain',
  nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://berachain-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://berachain-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'BeraExplorer', url: 'https://explorer.berachain.com' }
  }
})

const zora = defineChain({
  id: 7777777,
  name: 'Zora',
  network: 'zora',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://zora-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://zora-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'ZoraExplorer', url: 'https://explorer.zora.energy' }
  }
})

const ronin = defineChain({
  id: 2020,
  name: 'Ronin',
  network: 'ronin',
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://ronin-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://ronin-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'RoninExplorer', url: 'https://explorer.roninchain.com' }
  }
})

const story = defineChain({
  id: 1513,
  name: 'Story',
  network: 'story',
  nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://story-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://story-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'StoryExplorer', url: 'https://explorer.story.foundation' }
  }
})

const lens = defineChain({
  id: 37111,
  name: 'Lens',
  network: 'lens',
  nativeCurrency: { name: 'GRASS', symbol: 'GRASS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://lens-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://lens-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'LensExplorer', url: 'https://explorer.lens.network' }
  }
})

const ink = defineChain({
  id: 57073,
  name: 'Ink',
  network: 'ink',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://ink-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://ink-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'InkExplorer', url: 'https://explorer.ink.network' }
  }
})

const degen = defineChain({
  id: 666666666,
  name: 'Degen',
  network: 'degen',
  nativeCurrency: { name: 'DEGEN', symbol: 'DEGEN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://degen-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://degen-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'DegenExplorer', url: 'https://explorer.degen.tips' }
  }
})

const abstractChain = defineChain({
  id: 11124,
  name: 'Abstract',
  network: 'abstract',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://abstract-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://abstract-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'AbstractExplorer', url: 'https://explorer.abstract.xyz' }
  }
})

const unichain = defineChain({
  id: 1301,
  name: 'Unichain',
  network: 'unichain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://unichain-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://unichain-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'UnichainExplorer', url: 'https://explorer.unichain.org' }
  }
})

const flowEvm = defineChain({
  id: 747,
  name: 'Flow EVM',
  network: 'flow-evm',
  nativeCurrency: { name: 'FLOW', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://flow-evm-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://flow-evm-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'FlowExplorer', url: 'https://explorer.flow.com' }
  }
})

const apeChain = defineChain({
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { name: 'APE', symbol: 'APE', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://apechain-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://apechain-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'ApeExplorer', url: 'https://explorer.apechain.com' }
  }
})

const sei = defineChain({
  id: 1329,
  name: 'Sei',
  network: 'sei',
  nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sei-mainnet.g.alchemy.com/public'] },
    public: { http: ['https://sei-mainnet.g.alchemy.com/public'] }
  },
  blockExplorers: {
    default: { name: 'SeiExplorer', url: 'https://explorer.sei.io' }
  }
})

// Enhanced RPC configuration with Alchemy endpoints
const getAlchemyUrl = (network: string) => {
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  if (!alchemyKey) {
    console.warn(`NEXT_PUBLIC_ALCHEMY_API_KEY not found, falling back to default RPC for ${network}`)
    return undefined
  }
  
  const alchemyNetworks: Record<string, string> = {
    // Major Networks
    mainnet: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    base: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    polygon: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    optimism: `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    
    // Layer 2s & Sidechains
    polygonZkEvm: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    zksync: `https://zksync-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    linea: `https://linea-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    scroll: `https://scroll-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    blast: `https://blast-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    mantle: `https://mantle-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    
    // Alternative Layer 1s
    avalanche: `https://avax-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    fantom: `https://fantom-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    celo: `https://celo-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    gnosis: `https://gnosis-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    metis: `https://metis-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    
    // BSC Family
    opBNB: `https://opbnb-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    
    // Newer/Smaller Networks (may or may not have Alchemy support)
    worldchain: `https://worldchain-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    shape: `https://shape-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    berachain: `https://berachain-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    zora: `https://zora-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    ronin: `https://ronin-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    story: `https://story-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    lens: `https://lens-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    ink: `https://ink-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    degen: `https://degen-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    abstract: `https://abstract-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    unichain: `https://unichain-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    flowEvm: `https://flow-evm-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    apeChain: `https://apechain-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    sei: `https://sei-mainnet.g.alchemy.com/v2/${alchemyKey}`,
  }
  
  return alchemyNetworks[network]
}

const config = createConfig({
  chains: [
    // Major Networks
    mainnet, 
    base, 
    polygon, 
    arbitrum, 
    optimism,
    
    // Layer 2s & ZK Rollups
    zksync,
    polygonZkEvm,
    linea,
    scroll,
    blast,
    mantle,
    
    // Alternative Layer 1s
    avalanche,
    fantom,
    celo,
    gnosis,
    metis,
    
    // BSC Family
    bsc,
    opBNB,
    
    // Newer/Emerging Networks
    worldChain,
    shape,
    berachain,
    zora,
    ronin,
    story,
    lens,
    ink,
    degen,
    abstractChain,
    unichain,
    flowEvm,
    apeChain,
    sei
  ],
  multiInjectedProviderDiscovery: false,
  transports: {
    // Major Networks
    [mainnet.id]: http(getAlchemyUrl('mainnet')),
    [base.id]: http(getAlchemyUrl('base')),
    [polygon.id]: http(getAlchemyUrl('polygon')),
    [arbitrum.id]: http(getAlchemyUrl('arbitrum')),
    [optimism.id]: http(getAlchemyUrl('optimism')),
    
    // Layer 2s & ZK Rollups
    [zksync.id]: http(getAlchemyUrl('zksync')),
    [polygonZkEvm.id]: http(getAlchemyUrl('polygonZkEvm')),
    [linea.id]: http(getAlchemyUrl('linea')),
    [scroll.id]: http(getAlchemyUrl('scroll')),
    [blast.id]: http(getAlchemyUrl('blast')),
    [mantle.id]: http(getAlchemyUrl('mantle')),
    
    // Alternative Layer 1s
    [avalanche.id]: http(getAlchemyUrl('avalanche')),
    [fantom.id]: http(getAlchemyUrl('fantom')),
    [celo.id]: http(getAlchemyUrl('celo')),
    [gnosis.id]: http(getAlchemyUrl('gnosis')),
    [metis.id]: http(getAlchemyUrl('metis')),
    
    // BSC Family
    [bsc.id]: http(), // Uses default RPC (no Alchemy support)
    [opBNB.id]: http(getAlchemyUrl('opBNB')),
    
    // Newer/Emerging Networks (fallback to default RPC if Alchemy doesn't support)
    [worldChain.id]: http(getAlchemyUrl('worldchain')),
    [shape.id]: http(getAlchemyUrl('shape')),
    [berachain.id]: http(getAlchemyUrl('berachain')),
    [zora.id]: http(getAlchemyUrl('zora')),
    [ronin.id]: http(getAlchemyUrl('ronin')),
    [story.id]: http(getAlchemyUrl('story')),
    [lens.id]: http(getAlchemyUrl('lens')),
    [ink.id]: http(getAlchemyUrl('ink')),
    [degen.id]: http(getAlchemyUrl('degen')),
    [abstractChain.id]: http(getAlchemyUrl('abstract')),
    [unichain.id]: http(getAlchemyUrl('unichain')),
    [flowEvm.id]: http(getAlchemyUrl('flowEvm')),
    [apeChain.id]: http(getAlchemyUrl('apeChain')),
    [sei.id]: http(getAlchemyUrl('sei')),
  },
})

const queryClient = new QueryClient()

// Get environment ID with fallback and validation
const getEnvironmentId = () => {
  const envId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID
  if (!envId) {
    if (typeof window === 'undefined') {
      // During build/server-side rendering, use a placeholder
      console.warn('NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is not set')
      return 'build-placeholder'
    } else {
      // In the browser, this is a real error
      throw new Error('NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is required but not set')
    }
  }
  return envId
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const environmentId = getEnvironmentId()
  
  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
        initialAuthenticationMode: "connect-only",
        shadowDOMEnabled: true,
        events: {
          onAuthSuccess: (args) => {
            console.log("Auth success:", args)
          },
          onLogout: () => {
            console.log("Logged out")
          },
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  )
}
