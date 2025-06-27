import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

// GET /api/user/[address] - Get user by address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectDB()
    
    const { address } = await params
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }
    
    const user = await User.findOne({ 
      address: address.toLowerCase(),
      isActive: true 
    }).select('-__v')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ user })
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/user/[address] - Update user by address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectDB()
    
    const { address } = await params
    const body = await request.json()
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // SECURITY: Verify wallet ownership before allowing updates
    const { verifyWalletOwnership } = await import('@/lib/auth-middleware')
    const authResult = await verifyWalletOwnership(request, address)
    
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fields that can be updated
    const allowedUpdates = ['displayName', 'bio', 'avatar', 'twitter', 'github', 'website', 'preferredCurrency', 'minDonationAmount']
    const updates: any = {}
    
    // Filter and validate updates
    for (const [key, value] of Object.entries(body)) {
      if (allowedUpdates.includes(key)) {
        if (typeof value === 'string') {
          updates[key] = value.trim()
        } else {
          updates[key] = value
        }
      }
    }
    
    // Validate field lengths
    if (updates.displayName && updates.displayName.length > 50) {
      return NextResponse.json(
        { error: 'Display name must be 50 characters or less' },
        { status: 400 }
      )
    }
    
    if (updates.bio && updates.bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be 500 characters or less' },
        { status: 400 }
      )
    }
    
    const user = await User.findOneAndUpdate(
      { address: address.toLowerCase(), isActive: true },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-__v')
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'User updated successfully',
      user
    })
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/[address] - Soft delete user (set isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectDB()
    
    const { address } = await params
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // SECURITY: Verify wallet ownership before allowing deletion
    const { verifyWalletOwnership } = await import('@/lib/auth-middleware')
    const authResult = await verifyWalletOwnership(request, address)
    
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = await User.findOneAndUpdate(
      { address: address.toLowerCase(), isActive: true },
      { $set: { isActive: false } },
      { new: true }
    )
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'User deactivated successfully'
    })
    
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    )
  }
}
