// Price service for fetching real-time token prices
interface TokenPrice {
  usd: number;
  usd_24h_change: number;
}

interface PriceResponse {
  [key: string]: TokenPrice;
}

// CoinGecko token ID mappings for common tokens
const COINGECKO_TOKEN_IDS: Record<string, string> = {
  // Native tokens
  'ETH': 'ethereum',
  'MATIC': 'matic-network',
  'BNB': 'binancecoin',
  'AVAX': 'avalanche-2',
  'FTM': 'fantom',
  
  // Wrapped tokens
  'WETH': 'ethereum',
  'WBTC': 'wrapped-bitcoin',
  'WMATIC': 'matic-network',
  
  // Stablecoins
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'BUSD': 'binance-usd',
  'FRAX': 'frax',
  
  // Major tokens
  'UNI': 'uniswap',
  'LINK': 'chainlink',
  'AAVE': 'aave',
  'COMP': 'compound-governance-token',
  'MKR': 'maker',
  'SNX': 'havven',
  'CRV': 'curve-dao-token',
  'SUSHI': 'sushi',
  '1INCH': '1inch',
  
  // Base ecosystem
  'DEGEN': 'degen-base',
  'BRETT': 'brett',
  'TOSHI': 'toshi',
  
  // Popular meme coins (may or may not have CoinGecko listings)
  'POOP': 'poopcoin', // This might not exist, but we try
  'POGS': 'pogcoin', // This might not exist, but we try
  
  // Other popular tokens
  'SHIB': 'shiba-inu',
  'DOGE': 'dogecoin',
  'PEPE': 'pepe',
};

// Contract address to CoinGecko ID mappings for specific chains
const CONTRACT_TO_COINGECKO: Record<number, Record<string, string>> = {
  1: { // Ethereum
    '0xa0b86a33e6441b8435b662c8c0b0e4e194c8b0b8': 'usd-coin',
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether',
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'wrapped-bitcoin',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'ethereum',
  },
  8453: { // Base
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'usd-coin',
    '0x4200000000000000000000000000000000000006': 'ethereum',
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'dai',
    '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': 'degen-base', // DEGEN
    '0x532f27101965dd16442e59d40670faf5ebb142e4': 'brett', // BRETT (if exists)
    // Note: Many Base meme coins don't have CoinGecko listings
  },
  137: { // Polygon
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'usd-coin',
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'tether',
    '0x8f3cf7ad23cd3cadbad9735aff958023239c6a063': 'dai',
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619': 'ethereum',
  },
};

// Cache for prices to avoid excessive API calls
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get token price in USD from CoinGecko
 */
export async function getTokenPrice(symbol: string, contractAddress?: string, chainId?: number): Promise<number> {
  // First try to get CoinGecko ID from contract address
  let coingeckoId: string | undefined;
  
  if (contractAddress && chainId && CONTRACT_TO_COINGECKO[chainId]) {
    coingeckoId = CONTRACT_TO_COINGECKO[chainId][contractAddress.toLowerCase()];
  }
  
  // Fallback to symbol mapping
  if (!coingeckoId) {
    coingeckoId = COINGECKO_TOKEN_IDS[symbol.toUpperCase()];
  }
  
  // If no mapping found, return 0 (unknown token)
  if (!coingeckoId) {
    console.log(`💰 No price data available for ${symbol} - using token-based presets`);
    return 0;
  }
  
  // Check cache first
  const cacheKey = coingeckoId;
  const cached = priceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data: PriceResponse = await response.json();
    const price = data[coingeckoId]?.usd || 0;
    
    // Cache the price
    priceCache.set(cacheKey, { price, timestamp: Date.now() });
    
    console.log(`💰 Price fetched for ${symbol}: $${price}`);
    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Calculate token amount needed for a specific USD value
 */
export function calculateTokenAmount(usdAmount: number, tokenPriceUsd: number, decimals: number = 18): string {
  if (tokenPriceUsd <= 0) return '0';
  
  const tokenAmount = usdAmount / tokenPriceUsd;
  
  // Format with appropriate decimal places
  if (tokenAmount >= 1) {
    return tokenAmount.toFixed(2);
  } else if (tokenAmount >= 0.01) {
    return tokenAmount.toFixed(4);
  } else {
    return tokenAmount.toFixed(6);
  }
}

/**
 * Calculate USD value of a token amount
 */
export function calculateUsdValue(tokenAmount: number, tokenPriceUsd: number): number {
  return tokenAmount * tokenPriceUsd;
}

/**
 * Get multiple token prices at once
 */
export async function getMultipleTokenPrices(tokens: Array<{ symbol: string; contractAddress?: string; chainId?: number }>): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  // Get unique CoinGecko IDs
  const coingeckoIds = new Set<string>();
  const symbolToCoingeckoId: Record<string, string> = {};
  
  for (const token of tokens) {
    let coingeckoId: string | undefined;
    
    // Try contract address first
    if (token.contractAddress && token.chainId && CONTRACT_TO_COINGECKO[token.chainId]) {
      coingeckoId = CONTRACT_TO_COINGECKO[token.chainId][token.contractAddress.toLowerCase()];
    }
    
    // Fallback to symbol
    if (!coingeckoId) {
      coingeckoId = COINGECKO_TOKEN_IDS[token.symbol.toUpperCase()];
    }
    
    if (coingeckoId) {
      coingeckoIds.add(coingeckoId);
      symbolToCoingeckoId[token.symbol] = coingeckoId;
    }
  }
  
  if (coingeckoIds.size === 0) {
    return prices;
  }
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${Array.from(coingeckoIds).join(',')}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data: PriceResponse = await response.json();
    
    // Map back to symbols
    for (const token of tokens) {
      const coingeckoId = symbolToCoingeckoId[token.symbol];
      if (coingeckoId && data[coingeckoId]) {
        prices[token.symbol] = data[coingeckoId].usd;
        
        // Cache individual prices
        priceCache.set(coingeckoId, { 
          price: data[coingeckoId].usd, 
          timestamp: Date.now() 
        });
      }
    }
    
    console.log('💰 Batch prices fetched:', prices);
    return prices;
  } catch (error) {
    console.error('Failed to fetch batch prices:', error);
    return prices;
  }
}

/**
 * Check if a token is a stablecoin (price should be ~$1)
 */
export function isStablecoin(symbol: string): boolean {
  const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD', 'FRAX', 'TUSD', 'LUSD'];
  return stablecoins.includes(symbol.toUpperCase());
}

/**
 * Get fallback price for stablecoins if API fails
 */
export function getFallbackPrice(symbol: string): number {
  if (isStablecoin(symbol)) {
    return 1.0; // Assume $1 for stablecoins
  }
  return 0;
} 