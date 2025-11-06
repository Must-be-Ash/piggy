import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { validateCDPAuth, extractEvmAddressesFromCDPUser } from '@/lib/cdp-auth'

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

    // SECURITY: Verify CDP authentication and wallet ownership
    const authResult = await validateCDPAuth(request)

    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status }
      )
    }

    // Verify the authenticated user owns the address being modified
    const userAddresses = extractEvmAddressesFromCDPUser(authResult.user)
    if (!userAddresses.some(addr => addr.toLowerCase() === address.toLowerCase())) {
      return NextResponse.json(
        { error: 'You can only update your own profile' },
        { status: 403 }
      )
    }
    
    // Fields that can be updated
    const allowedUpdates = ['displayName', 'bio', 'avatar', 'twitter', 'farcaster', 'github', 'linkedin', 'website', 'preferredCurrency', 'minDonationAmount']
    const updates: Record<string, unknown> = {}

    // Filter and validate updates
    for (const [key, value] of Object.entries(body)) {
      if (allowedUpdates.includes(key)) {
        if (typeof value === 'string') {
          const trimmed = value.trim()
          // Convert empty strings to null for optional fields
          updates[key] = trimmed === '' ? null : trimmed
        } else {
          updates[key] = value
        }
      }
    }
    
    // Validate field lengths
    if (updates.displayName && typeof updates.displayName === 'string' && updates.displayName.length > 50) {
      return NextResponse.json(
        { error: 'Display name must be 50 characters or less' },
        { status: 400 }
      )
    }

    if (updates.bio && typeof updates.bio === 'string' && updates.bio.length > 500) {
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

    // SECURITY: Verify CDP authentication and wallet ownership
    const authResult = await validateCDPAuth(request)

    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status }
      )
    }

    // Verify the authenticated user owns the address being deleted
    const userAddresses = extractEvmAddressesFromCDPUser(authResult.user)
    if (!userAddresses.some(addr => addr.toLowerCase() === address.toLowerCase())) {
      return NextResponse.json(
        { error: 'You can only delete your own account' },
        { status: 403 }
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
