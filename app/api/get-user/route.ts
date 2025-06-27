import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

// GET /api/get-user?address=... or /api/get-user?slug=... - Get user by address or slug
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const slug = searchParams.get('slug')
    
    // Validate that either address or slug is provided
    if (!address && !slug) {
      return NextResponse.json(
        { error: 'Either address or slug parameter is required' },
        { status: 400 }
      )
    }
    
    // Build query based on provided parameter
    const query: Record<string, unknown> = { isActive: true }
    
    if (address) {
      query.address = address.toLowerCase()
    } else if (slug) {
      query.slug = slug.toLowerCase()
    }
    
    const user = await User.findOne(query).select('-__v')
    
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

// PUT /api/get-user?address=... - Update user by address
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const body = await request.json()
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required for updates' },
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
    const allowedUpdates = ['displayName', 'bio', 'avatar', 'twitter', 'farcaster', 'github', 'website', 'preferredCurrency', 'minDonationAmount']
    const updates: Record<string, unknown> = {}
    
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

    // If displayName is being updated, generate a new slug
    if (updates.displayName && typeof updates.displayName === 'string') {
      const generateSlug = (name: string, address: string) => {
        if (name && name.trim()) {
          return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
        }
        return address?.slice(0, 8).toLowerCase() || "user"
      }
      
      const newSlug = generateSlug(updates.displayName, address)
      
      // Check if the new slug conflicts with another user
      const existingUser = await User.findOne({ 
        slug: newSlug, 
        address: { $ne: address.toLowerCase() },
        isActive: true 
      })
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'This username is already taken by another user' },
          { status: 409 }
        )
      }
      
      updates.slug = newSlug
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

// DELETE /api/get-user?address=... - Soft delete user (set isActive to false)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required for deletion' },
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