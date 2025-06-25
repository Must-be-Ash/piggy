// Test script for token detection
const { detectAllTokens } = require('./lib/token-detection.ts');

async function testTokenDetection() {
  const walletAddress = '0x4D4a1899786E277b2F40054bcf85fB82e1cA2BDa';
  const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  
  console.log('🧪 Testing Token Detection CLI');
  console.log('Wallet:', walletAddress);
  console.log('API Key:', alchemyApiKey ? 'Present' : 'Missing');
  console.log('');
  
  if (!alchemyApiKey) {
    console.error('❌ NEXT_PUBLIC_ALCHEMY_API_KEY not found in environment');
    process.exit(1);
  }
  
  // Test Ethereum Mainnet
  console.log('🔍 Testing Ethereum Mainnet (Chain ID: 1)...');
  try {
    const ethTokens = await detectAllTokens({
      walletAddress,
      chainId: 1,
      alchemyApiKey
    });
    
    console.log(`✅ Ethereum: Found ${ethTokens.length} tokens`);
    ethTokens.forEach(token => {
      console.log(`  - ${token.symbol}: ${token.balanceFormatted} (${token.name})`);
    });
  } catch (error) {
    console.error('❌ Ethereum test failed:', error.message);
  }
  
  console.log('');
  
  // Test Base Network
  console.log('🔍 Testing Base Network (Chain ID: 8453)...');
  try {
    const baseTokens = await detectAllTokens({
      walletAddress,
      chainId: 8453,
      alchemyApiKey
    });
    
    console.log(`✅ Base: Found ${baseTokens.length} tokens`);
    baseTokens.forEach(token => {
      console.log(`  - ${token.symbol}: ${token.balanceFormatted} (${token.name})`);
    });
  } catch (error) {
    console.error('❌ Base test failed:', error.message);
  }
  
  console.log('');
  console.log('🎉 Test completed!');
}

// Run the test
testTokenDetection().catch(console.error); 