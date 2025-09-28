// Smart preset amounts based on token characteristics
interface PresetConfig {
  type: 'usd' | 'token';
  amounts: number[];
  label: string;
}

/**
 * Determines appropriate preset amounts based on token characteristics
 */
export function getSmartPresets(
  token: {
    symbol: string;
    balanceFormatted: string;
    decimals: number;
    isNative?: boolean;
  },
  tokenPrice: number
): PresetConfig {
  const balance = parseFloat(token.balanceFormatted);
  const symbol = token.symbol.toUpperCase();
  
  // High-value tokens (ETH, WBTC, etc.) - use small token amounts
  if (isHighValueToken(symbol) || tokenPrice > 100) {
    return {
      type: 'token',
      amounts: [0.001, 0.005, 0.01, 0.05, 0.1, 0.25],
      label: 'Token amounts'
    };
  }
  
  // Stablecoins and medium-value tokens - use USD equivalents
  if (isStablecoin(symbol) || (tokenPrice >= 0.1 && tokenPrice <= 100)) {
    return {
      type: 'usd',
      amounts: [5, 10, 25, 50, 100, 250],
      label: 'USD equivalent'
    };
  }
  
  // Meme coins and unknown price tokens - use token amounts based on balance
  if (tokenPrice === 0 || tokenPrice < 0.1) {
    return getMemeTokenPresets(balance);
  }
  
  // Default fallback
  return {
    type: 'token',
    amounts: [1, 10, 100, 1000, 10000, 100000],
    label: 'Token amounts'
  };
}

/**
 * Generate presets for meme coins based on available balance
 */
function getMemeTokenPresets(balance: number): PresetConfig {
  // For very large balances (millions+)
  if (balance >= 1000000) {
    return {
      type: 'token',
      amounts: [10000, 50000, 100000, 500000, 1000000, balance * 0.1],
      label: 'Token amounts'
    };
  }
  
  // For large balances (thousands)
  if (balance >= 1000) {
    return {
      type: 'token',
      amounts: [10, 50, 100, 500, 1000, Math.min(balance * 0.1, 10000)],
      label: 'Token amounts'
    };
  }
  
  // For medium balances (hundreds)
  if (balance >= 100) {
    return {
      type: 'token',
      amounts: [1, 5, 10, 25, 50, Math.min(balance * 0.1, 100)],
      label: 'Token amounts'
    };
  }
  
  // For small balances
  if (balance >= 10) {
    return {
      type: 'token',
      amounts: [0.1, 0.5, 1, 2, 5, Math.min(balance * 0.1, 10)],
      label: 'Token amounts'
    };
  }
  
  // For very small balances
  return {
    type: 'token',
    amounts: [0.01, 0.05, 0.1, 0.25, 0.5, Math.min(balance * 0.1, 1)],
    label: 'Token amounts'
  };
}

/**
 * Check if token is high-value (ETH, BTC, etc.)
 */
function isHighValueToken(symbol: string): boolean {
  const highValueTokens = [
    'ETH', 'WETH', 'BTC', 'WBTC', 'BNB', 'SOL', 'AVAX', 'MATIC'
  ];
  return highValueTokens.includes(symbol);
}

/**
 * Check if token is a stablecoin
 */
function isStablecoin(symbol: string): boolean {
  const stablecoins = [
    'USDC', 'USDT', 'DAI', 'BUSD', 'FRAX', 'TUSD', 'LUSD', 'USDP', 'GUSD'
  ];
  return stablecoins.includes(symbol);
}

/**
 * Format preset amount for display
 */
export function formatPresetAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  if (amount >= 100) {
    return amount.toFixed(0);
  }
  if (amount >= 1) {
    return amount.toFixed(1);
  }
  if (amount >= 0.01) {
    return amount.toFixed(2);
  }
  return amount.toFixed(4);
}

/**
 * Format amount for button display (shorter format)
 */
export function formatButtonAmount(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  if (amount >= 100) {
    return amount.toFixed(0);
  }
  if (amount >= 10) {
    return amount.toFixed(0);
  }
  if (amount >= 1) {
    return amount.toFixed(1);
  }
  if (amount >= 0.1) {
    return amount.toFixed(1);
  }
  if (amount >= 0.01) {
    return amount.toFixed(2);
  }
  return amount.toFixed(3);
}

/**
 * Calculate USD value for display (when available)
 */
export function calculateDisplayValue(
  amount: number,
  tokenPrice: number,
  presetType: 'usd' | 'token'
): string | null {
  if (presetType === 'usd') {
    return `$${amount}`;
  }
  
  if (tokenPrice > 0) {
    const usdValue = amount * tokenPrice;
    if (usdValue >= 0.01) {
      return `≈ $${usdValue.toFixed(2)}`;
    }
    return `≈ $${usdValue.toFixed(4)}`;
  }
  
  return null;
} 