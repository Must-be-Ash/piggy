'use client';

import { useState, useEffect } from 'react';

export interface TokenWithBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  logo?: string;
  isNative?: boolean;
}

export interface TokenDetectionConfig {
  walletAddress: string;
  chainId: number;
  alchemyApiKey?: string;
}

// Common token lists by chain for logos and metadata
export const TOKEN_LISTS = {
  1: 'https://tokens.uniswap.org', // Ethereum
  8453: 'https://static.optimism.io/optimism.tokenlist.json', // Base (uses Optimism format)
  137: 'https://unpkg.com/quickswap-default-token-list@1.2.28/build/quickswap-default.tokenlist.json', // Polygon
  42161: 'https://bridge.arbitrum.io/token-list-42161.json', // Arbitrum
  10: 'https://static.optimism.io/optimism.tokenlist.json', // Optimism
  56: 'https://tokens.pancakeswap.finance/pancakeswap-extended.json', // BSC
} as const;

// Alchemy API endpoints by chain
export const ALCHEMY_ENDPOINTS = {
  1: 'eth-mainnet',
  8453: 'base-mainnet',
  137: 'polygon-mainnet',
  42161: 'arb-mainnet',
  10: 'opt-mainnet',
  56: 'bnb-mainnet',
} as const;

/**
 * Detects all tokens in a wallet using Alchemy's getTokenBalances API
 */
export async function detectTokensWithAlchemy(
  config: TokenDetectionConfig
): Promise<TokenWithBalance[]> {
  const { walletAddress, chainId, alchemyApiKey } = config;
  
  console.log('🔍 Alchemy Detection Started:', { walletAddress, chainId, hasApiKey: !!alchemyApiKey });
  
  if (!alchemyApiKey) {
    console.warn('❌ No Alchemy API key provided, skipping Alchemy token detection');
    return [];
  }

  const endpoint = ALCHEMY_ENDPOINTS[chainId as keyof typeof ALCHEMY_ENDPOINTS];
  if (!endpoint) {
    console.warn(`❌ Alchemy not supported for chain ${chainId}`);
    return [];
  }
  
  console.log('🌐 Using Alchemy endpoint:', endpoint);

  try {
    const response = await fetch(`https://${endpoint}.g.alchemy.com/v2/${alchemyApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenBalances',
        params: [walletAddress, 'erc20'], // 'erc20' gets ALL ERC20 tokens
        id: 1,
      }),
    });

    const data = await response.json();
    
    console.log('📊 Alchemy Response:', { 
      success: !data.error, 
      tokenCount: data.result?.tokenBalances?.length || 0,
      error: data.error?.message 
    });
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const tokenBalances = data.result.tokenBalances || [];
    const tokens: TokenWithBalance[] = [];

    // Batch fetch metadata for all tokens with non-zero balances
    const nonZeroTokens = tokenBalances.filter((token: any) => {
      if (token.error) return false;
      
      const balance = token.tokenBalance || '0x0';
      
      // First check for obvious zero cases
      if (balance === '0x0' || balance === '0x' || balance === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return false;
      }
      
      // Convert hex balance to BigInt to properly check if it's zero
      try {
        const balanceBigInt = BigInt(balance);
        const isNonZero = balanceBigInt > BigInt(0);
        console.log(`🔍 Token ${token.contractAddress}: ${balance} -> ${isNonZero ? 'NON-ZERO' : 'ZERO'}`);
        return isNonZero;
      } catch (error) {
        console.warn(`❌ Invalid balance format for ${token.contractAddress}:`, balance, error);
        return false;
      }
    });

    console.log('🔍 Processing tokens:', {
      total: tokenBalances.length,
      nonZero: nonZeroTokens.length,
      allBalances: tokenBalances.map((t: any) => ({ 
        address: t.contractAddress, 
        balance: t.tokenBalance,
        error: t.error
      })),
      nonZeroAddresses: nonZeroTokens.map((t: any) => ({ 
        address: t.contractAddress, 
        balance: t.tokenBalance 
      }))
    });

    await Promise.all(
      nonZeroTokens.map(async (token: any, index: number) => {
        try {
          console.log(`🔍 Fetching metadata ${index + 1}/${nonZeroTokens.length}:`, token.contractAddress);
          const metadata = await getTokenMetadata(token.contractAddress, chainId, alchemyApiKey);
          if (metadata) {
            const balanceFormatted = formatTokenBalance(token.tokenBalance, metadata.decimals);
            console.log(`✅ Token processed:`, {
              symbol: metadata.symbol,
              name: metadata.name,
              balance: balanceFormatted,
              address: token.contractAddress
            });
            tokens.push({
              address: token.contractAddress,
              name: metadata.name,
              symbol: metadata.symbol,
              decimals: metadata.decimals,
              balance: token.tokenBalance,
              balanceFormatted,
              logo: metadata.logo,
            });
          } else {
            console.warn(`❌ No metadata returned for token ${token.contractAddress}`);
          }
        } catch (error) {
          console.warn(`❌ Failed to get metadata for token ${token.contractAddress}:`, error);
        }
      })
    );

    console.log(`🎉 Final tokens processed: ${tokens.length}`);

    return tokens;
  } catch (error) {
    console.error('Alchemy token detection failed:', error);
    return [];
  }
}

/**
 * Gets token metadata from Alchemy
 */
async function getTokenMetadata(
  tokenAddress: string, 
  chainId: number, 
  alchemyApiKey: string
): Promise<{ name: string; symbol: string; decimals: number; logo?: string } | null> {
  const endpoint = ALCHEMY_ENDPOINTS[chainId as keyof typeof ALCHEMY_ENDPOINTS];
  if (!endpoint) {
    console.warn(`❌ No endpoint for chain ${chainId}`);
    return null;
  }

  try {
    const response = await fetch(`https://${endpoint}.g.alchemy.com/v2/${alchemyApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'alchemy_getTokenMetadata',
        params: [tokenAddress],
        id: 1,
      }),
    });

    const data = await response.json();
    
    console.log(`📋 Metadata for ${tokenAddress}:`, {
      success: !data.error,
      name: data.result?.name,
      symbol: data.result?.symbol,
      decimals: data.result?.decimals,
      error: data.error?.message
    });
    
    if (data.error || !data.result) {
      console.warn(`❌ Metadata failed for ${tokenAddress}:`, data.error?.message || 'No result');
      return null;
    }

    return {
      name: data.result.name || 'Unknown Token',
      symbol: data.result.symbol || 'UNKNOWN',
      decimals: data.result.decimals || 18,
      logo: data.result.logo || undefined,
    };
  } catch (error) {
    console.error(`❌ Network error getting metadata for ${tokenAddress}:`, error);
    return null;
  }
}

/**
 * Fetches token list for additional metadata and logos
 */
export async function fetchTokenList(chainId: number): Promise<any[]> {
  const tokenListUrl = TOKEN_LISTS[chainId as keyof typeof TOKEN_LISTS];
  if (!tokenListUrl) return [];

  try {
    const response = await fetch(tokenListUrl);
    const tokenList = await response.json();
    return tokenList.tokens || [];
  } catch (error) {
    console.warn(`Failed to fetch token list for chain ${chainId}:`, error);
    return [];
  }
}

/**
 * Enhanced token detection that combines multiple sources
 */
export async function detectAllTokens(config: TokenDetectionConfig): Promise<TokenWithBalance[]> {
  const { walletAddress, chainId } = config;
  
  // Start with Alchemy detection (gets ALL tokens including unknown ones)
  const alchemyTokens = await detectTokensWithAlchemy(config);
  
  // Fetch token list for additional metadata/logos
  const tokenList = await fetchTokenList(chainId);
  
  // Enhance tokens with token list data
  const enhancedTokens: TokenWithBalance[] = alchemyTokens.map(token => {
    const tokenListEntry = tokenList.find(t => 
      t.address?.toLowerCase() === token.address.toLowerCase()
    );
    
    return {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      balance: token.balance,
      balanceFormatted: token.balanceFormatted,
      name: tokenListEntry?.name || token.name,
      logo: tokenListEntry?.logoURI || token.logo,
      isNative: token.isNative,
    };
  });

  // Add native token if it has balance
  try {
    const nativeToken = await getNativeTokenBalance(walletAddress, chainId);
    if (nativeToken) {
      enhancedTokens.unshift(nativeToken); // Add native token first
    }
  } catch (error) {
    console.warn('Failed to get native token balance:', error);
  }

  return enhancedTokens.sort((a, b) => {
    // Sort by: 1. Native first, 2. Balance (high to low), 3. Alphabetical
    if (a.isNative && !b.isNative) return -1;
    if (!a.isNative && b.isNative) return 1;
    
    const aBalance = parseFloat(a.balanceFormatted) || 0;
    const bBalance = parseFloat(b.balanceFormatted) || 0;
    if (aBalance !== bBalance) return bBalance - aBalance;
    
    return a.symbol.localeCompare(b.symbol);
  });
}

/**
 * Gets native token (ETH) balance
 */
async function getNativeTokenBalance(
  walletAddress: string, 
  chainId: number
): Promise<TokenWithBalance | null> {
  // This would use wagmi hooks in the component, but here's the structure
  const nativeTokens = {
    1: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    8453: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    137: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
    42161: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    10: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    56: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  };

  const native = nativeTokens[chainId as keyof typeof nativeTokens];
  if (!native) return null;

  // In the actual component, this would use useBalance hook
  return {
    address: '0x0000000000000000000000000000000000000000', // Native token address
    name: native.name,
    symbol: native.symbol,
    decimals: native.decimals,
    balance: '0', // Will be filled by useBalance hook
    balanceFormatted: '0',
    isNative: true,
  };
}

/**
 * Formats token balance from hex to human readable
 */
function formatTokenBalance(hexBalance: string, decimals: number): string {
  try {
    const balance = BigInt(hexBalance);
    const divisor = BigInt(10 ** decimals);
    const quotient = balance / divisor;
    const remainder = balance % divisor;
    
    if (remainder === BigInt(0)) {
      return quotient.toString();
    }
    
    const decimalsStr = remainder.toString().padStart(decimals, '0');
    const trimmedDecimals = decimalsStr.replace(/0+$/, '');
    
    if (trimmedDecimals === '') {
      return quotient.toString();
    }
    
    return `${quotient}.${trimmedDecimals}`;
  } catch (error) {
    console.error('Failed to format token balance:', error);
    return '0';
  }
}

/**
 * Hook version for React components
 */
export function useTokenDetection(walletAddress: string, chainId: number) {
  const [tokens, setTokens] = useState<TokenWithBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress || !chainId) return;

    const detectTokens = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const detectedTokens = await detectAllTokens({
          walletAddress,
          chainId,
          alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY,
        });
        
        setTokens(detectedTokens);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to detect tokens');
      } finally {
        setLoading(false);
      }
    };

    detectTokens();
  }, [walletAddress, chainId]);

  const detectTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const detectedTokens = await detectAllTokens({
        walletAddress,
        chainId,
        alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY,
      });
      
      setTokens(detectedTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect tokens');
    } finally {
      setLoading(false);
    }
  };

  return { tokens, loading, error, refetch: detectTokens };
} 