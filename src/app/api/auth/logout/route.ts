import { NextRequest, NextResponse } from 'next/server'
import { signOut, handleAuthError } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Sign out the user
    await signOut()
    
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully logged out'
      },
      { status: 200 }
    )
    
  } catch (error: any) {
    console.error('Logout error:', error)
    
    // Handle authentication errors
    if (error.code) {
      const authError = handleAuthError(error)
      return NextResponse.json(
        {
          error: authError.message,
          code: authError.code
        },
        { status: 400 }
      )
    }
    
    // Handle unexpected errors
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during logout',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}