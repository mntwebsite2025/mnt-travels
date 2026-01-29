import { NextResponse } from "next/server"

export async function POST(request : Request) {
  try {
    // In a more complex setup, you might want to blacklist the token
    // For now, we'll just return a success response
    // The client should remove the token from localStorage

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
