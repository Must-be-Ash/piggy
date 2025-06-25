// Test script for token detection using ES modules
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Alchemy endpoints
const ALCHEMY_ENDPOINTS = {
  1: 'eth-mainnet',
  8453: 'base-mainnet',
};

// Test the actual Alchemy API calls directly
async function testAlchemyAPI(walletAddress, chainId, alchemyApiKey) {
  const endpoint = ALCHEMY_ENDPOINTS[chainId];
  if (!endpoint) {
    throw new Error(`No endpoint for chain ${chainId}`);
  }

  console.log(`🌐 Testing ${endpoint} for wallet ${walletAddress}...`);

  const response = await fetch(`https://${endpoint}.g.alchemy.com/v2/${alchemyApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'alchemy_getTokenBalances',
      params: [walletAddress, 'erc20'],
      id: 1,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  const tokenBalances = data.result.tokenBalances || [];
  
  console.log(`📊 Raw response: ${tokenBalances.length} total tokens`);
  
  // Test our new filtering logic (exact same as TypeScript code)
  console.log('🔍 Starting token filtering...');
  const nonZeroTokens = tokenBalances.filter((token) => {
    console.log(`🔍 Processing token ${token.contractAddress}:`);
    console.log(`  - Error: ${token.error}`);
    console.log(`  - Balance: ${token.tokenBalance}`);
    
    if (token.error) {
      console.log(`  ❌ Skipping due to error: ${token.error}`);
      return false;
    }
    
    const balance = token.tokenBalance || '0x0';
    
    // First check for obvious zero cases
    if (balance === '0x0' || balance === '0x' || balance === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log(`  ❌ Skipping obvious zero balance`);
      return false;
    }
    
    // Convert hex balance to BigInt to properly check if it's zero
    try {
      const balanceBigInt = BigInt(balance);
      const isNonZero = balanceBigInt > BigInt(0);
      console.log(`  🔍 BigInt conversion: ${balance} -> ${balanceBigInt.toString()} -> ${isNonZero ? 'NON-ZERO' : 'ZERO'}`);
      return isNonZero;
    } catch (error) {
      console.warn(`  ❌ Invalid balance format for ${token.contractAddress}:`, balance, error);
      return false;
    }
  });

  console.log(`✅ Non-zero tokens: ${nonZeroTokens.length}`);
  
  // Show first few tokens for debugging
  console.log('🔍 Sample token balances:');
  tokenBalances.slice(0, 5).forEach(token => {
    const balance = token.tokenBalance;
    const isZero = balance === '0x0' || balance === '0x' || balance === '0x0000000000000000000000000000000000000000000000000000000000000000';
    console.log(`  ${token.contractAddress}: ${balance} (zero: ${isZero})`);
  });
  
  if (nonZeroTokens.length > 0) {
    console.log('🎉 Non-zero tokens found:');
    nonZeroTokens.forEach(token => {
      console.log(`  ${token.contractAddress}: ${token.tokenBalance}`);
    });
  }
  
  return nonZeroTokens;
}

async function runTest() {
  const walletAddress = '0x4D4a1899786E277b2F40054bcf85fB82e1cA2BDa';
  const alchemyApiKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  
  console.log('🧪 Testing Token Detection CLI');
  console.log('Wallet:', walletAddress);
  console.log('API Key:', alchemyApiKey ? 'Present' : 'Missing');
  console.log('');
  
  if (!alchemyApiKey) {
    console.error('❌ ALCHEMY_API_KEY or NEXT_PUBLIC_ALCHEMY_API_KEY not found in environment');
    process.exit(1);
  }
  
  try {
    // Test Ethereum Mainnet
    console.log('🔍 Testing Ethereum Mainnet (Chain ID: 1)...');
    const ethTokens = await testAlchemyAPI(walletAddress, 1, alchemyApiKey);
    console.log('');
    
    // Test Base Network
    console.log('🔍 Testing Base Network (Chain ID: 8453)...');
    const baseTokens = await testAlchemyAPI(walletAddress, 8453, alchemyApiKey);
    console.log('');
    
    console.log('🎉 Test Summary:');
    console.log(`  Ethereum: ${ethTokens.length} tokens with balance`);
    console.log(`  Base: ${baseTokens.length} tokens with balance`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTest(); 