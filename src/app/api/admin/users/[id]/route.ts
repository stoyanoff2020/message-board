import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
import { isAdminServer, getCurrentUserServer } from '@/lib/auth'

/**
 * PUT /api/admin/users/[id] - Update user status (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const userId = params.id
    const currentUser = await getCurrentUserServer()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent admin from disabling themselves
    if (currentUser?.id === userId) {
      return NextResponse.json(
        { error: 'You cannot modify your own account status' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean value' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // First, check if the user exists and get their current status
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, is_admin, is_active')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent disabling admin users (additional safety check)
    if (existingUser.is_admin && !isActive) {
      return NextResponse.json(
        { error: 'Admin users cannot be disabled' },
        { status: 400 }
      )
    }

    // Update the user status
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, name, is_admin, is_active, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Transform the data to match our User interface
    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isAdmin: updatedUser.is_admin,
      isActive: updatedUser.is_active,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    }

    return NextResponse.json({
      success: true,
      message: `User ${isActive ? 'enabled' : 'disabled'} successfully`,
      user: transformedUser
    })

  } catch (error) {
    console.error('Admin update user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/users/[id] - Get a specific user details (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Fetch the user with message count
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        is_admin,
        is_active,
        created_at,
        updated_at
      `)
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get message count for this user
    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Transform the data to match our User interface
    const transformedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      messageCount: messageCount || 0
    }

    return NextResponse.json({
      user: transformedUser
    })

  } catch (error) {
    console.error('Admin get user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}