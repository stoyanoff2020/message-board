import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { signUp, handleAuthError } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    const { email, password, name } = validationResult.data
    
    // Create user account
    const user = await signUp(email, password, name)
    
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isActive: user.isActive
        }
      },
      { status: 201 }
    )
    
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle authentication errors
    if (error.code) {
      const authError = handleAuthError(error)
      return NextResponse.json(
        {
          error: authError.message,
          code: authError.code,
          field: authError.field
        },
        { status: 400 }
      )
    }
    
    // Handle unexpected errors
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during registration',
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