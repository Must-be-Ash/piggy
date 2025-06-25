import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

// GET /api/user - Get all users (for testing/admin)
export async function GET() {
  try {
    await connectDB()
    
    const users = await User.find({ isActive: true })
      .select('address slug displayName bio avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
    
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
