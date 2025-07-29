import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
import { isAdminServer } from '@/lib/auth'

/**
 * GET /api/admin/messages - Fetch all messages for admin moderation
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
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('messages')
      .select(`
        id,
        title,
        description,
        publisher_name,
        contact_phone,
        user_id,
        created_at,
        updated_at,
        users!inner(
          id,
          name,
          email,
          is_active
        )
      `)
      .order('created_at', { ascending: false })

    // Add search filter if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,publisher_name.ilike.%${search}%`)
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data: messages, error, count } = await query

    if (error) {
      console.error('Error fetching admin messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Transform the data to match our Message interface
    const transformedMessages = messages?.map(msg => ({
      id: msg.id,
      title: msg.title,
      description: msg.description,
      publisherName: msg.publisher_name,
      contactPhone: msg.contact_phone,
      userId: msg.user_id,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at,
      user: {
        id: (msg.users as any)?.id,
        name: (msg.users as any)?.name,
        email: (msg.users as any)?.email,
        isActive: (msg.users as any)?.is_active
      }
    })) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      messages: transformedMessages,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Admin messages API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}