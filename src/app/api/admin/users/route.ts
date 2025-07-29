import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
import { isAdminServer } from '@/lib/auth'

/**
 * GET /api/admin/users - Fetch all users for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const isAdmin = await isAdminServer()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const supabase = createSupabaseServerClient()
    
    // Get search parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // 'active', 'inactive', or null for all
    
    const offset = (page - 1) * limit

    let query = supabase
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
      .order('created_at', { ascending: false })

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Add status filter if provided
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) {
      console.error('Error fetching admin users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Transform the data to match our User interface
    const transformedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.is_admin,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    })) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get additional stats
    const { count: activeCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { count: adminCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true)

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      },
      stats: {
        total: totalCount || 0,
        active: activeCount || 0,
        inactive: (totalCount || 0) - (activeCount || 0),
        admin: adminCount || 0
      }
    })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}