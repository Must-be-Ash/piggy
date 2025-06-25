import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const currentAddress = searchParams.get("currentAddress") // To exclude current user when editing

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if slug exists, but exclude current user if editing
    const query = currentAddress 
      ? { slug, address: { $ne: currentAddress } }
      : { slug }
    
    const existingUser = await User.findOne(query)
    
    return NextResponse.json({ 
      available: !existingUser,
      slug 
    })
  } catch (error) {
    console.error("Error checking slug availability:", error)
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    )
  }
} 