const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

// Test MongoDB connection
async function testDatabase() {
  try {
    // Use the MongoDB URI from environment variables
    const MONGODB_URI = process.env.MONGODB_URI
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set in .env.local')
    }
    
    console.log('🔌 Connecting to MongoDB...')
    console.log('📍 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')) // Hide credentials
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB successfully!')
    
    // Test User model
    const UserSchema = new mongoose.Schema({
      address: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      displayName: String,
      bio: String,
      isActive: { type: Boolean, default: true }
    }, { timestamps: true })
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema)
    
    // Test creating a user
    console.log('👤 Testing user creation...')
    const testUser = new User({
      address: '0x1234567890123456789012345678901234567890',
      slug: 'test-user',
      displayName: 'Test User',
      bio: 'This is a test user for database testing'
    })
    
    await testUser.save()
    console.log('✅ Test user created successfully!')
    
    // Test finding the user
    console.log('🔍 Testing user retrieval...')
    const foundUser = await User.findOne({ slug: 'test-user' })
    console.log('✅ User found:', foundUser.displayName)
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...')
    await User.deleteOne({ slug: 'test-user' })
    console.log('✅ Test data cleaned up!')
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    
    if (error.code === 11000) {
      console.log('ℹ️  Test user already exists, cleaning up...')
      try {
        const User = mongoose.models.User
        if (User) {
          await User.deleteOne({ slug: 'test-user' })
          console.log('✅ Cleaned up existing test user')
        }
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError.message)
      }
    }
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

testDatabase() 