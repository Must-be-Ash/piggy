import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

// POST /api/create-user - Create a new user
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { address, slug, displayName, bio, avatar, twitter, farcaster, github, linkedin, website } = body
    
    // Validate required fields
    if (!address || !slug) {
      return NextResponse.json(
        { error: 'Address and slug are required' },
        { status: 400 }
      )
    }
    
    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 30) {
      return NextResponse.json(
        { error: 'Slug must be 3-30 characters, lowercase letters, numbers, and hyphens only' },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { address: address.toLowerCase() },
        { slug: slug.toLowerCase() }
      ]
    })
    
    if (existingUser) {
      if (existingUser.address === address.toLowerCase()) {
        return NextResponse.json(
          { error: 'User with this address already exists' },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { error: 'This slug is already taken' },
          { status: 409 }
        )
      }
    }
    
    // Create new user
    const newUser = new User({
      address: address.toLowerCase(),
      slug: slug.toLowerCase(),
      displayName: displayName?.trim() || '',
      bio: bio?.trim() || '',
      avatar: avatar?.trim() || null,
      twitter: twitter?.trim() || null,
      farcaster: farcaster?.trim() || null,
      github: github?.trim() || null,
      linkedin: linkedin?.trim() || null,
      website: website?.trim() || null
    })
    
    await newUser.save()
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUser._id,
          address: newUser.address,
          slug: newUser.slug,
          displayName: newUser.displayName,
          bio: newUser.bio,
          avatar: newUser.avatar,
          twitter: newUser.twitter,
          farcaster: newUser.farcaster,
          github: newUser.github,
          linkedin: newUser.linkedin,
          website: newUser.website,
          createdAt: newUser.createdAt
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating user:', error)

    // Handle duplicate key errors (MongoDB error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000 && 'keyPattern' in error) {
      const field = Object.keys(error.keyPattern as Record<string, unknown>)[0]
      return NextResponse.json(
        { error: `This ${field} is already taken` },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 