import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { messageSchema } from '@/lib/validations'
import { formatPhoneNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Helper function to build search query
function buildSearchQuery(query: string) {
  const searchQuery = query.trim()
  
  // Sanitize the query for full-text search
  const sanitizedQuery = searchQuery
    .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 0) // Remove empty strings
    .join(' & ') // Join with AND operator
  
  if (!sanitizedQuery) {
    // If no valid search terms, fall back to ILIKE only
    return `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
  }
  
  // Combine full-text search with ILIKE for better results
  return `
    to_tsvector('english', title || ' ' || description).@@.to_tsquery('english', '${sanitizedQuery}'),
    title.ilike.%${searchQuery}%,
    description.ilike.%${searchQuery}%
  `
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = messageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: validationResult.error.issues.map(issue => ({
            field: issue.path[0],
            message: issue.message
          }))
        },
        { status: 400 }
      )
    }

    const { title, description, contactPhone } = validationResult.data

    // Create message in database
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        title,
        description,
        contact_phone: formatPhoneNumber(contactPhone),
        publisher_name: userProfile.name,
        user_id: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { message: 'Failed to create message' },
        { status: 500 }
      )
    }

    // Transform database response to match our interface
    const responseMessage = {
      id: message.id,
      title: message.title,
      description: message.description,
      publisherName: message.publisher_name,
      contactPhone: message.contact_phone,
      userId: message.user_id,
      createdAt: new Date(message.created_at),
      updatedAt: new Date(message.updated_at)
    }

    return NextResponse.json(
      { 
        message: responseMessage,
        success: true
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const orderBy = searchParams.get('orderBy') || 'created_at'
    const orderDirection = searchParams.get('orderDirection') || 'desc'

    // Build query
    let dbQuery = supabase
      .from('messages')
      .select('*')
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1)

    // Add search filter if query provided
    if (query && query.trim()) {
      dbQuery = dbQuery.or(buildSearchQuery(query))
    }

    const { data: messages, error } = await dbQuery

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Transform database response to match our interface
    const responseMessages = messages.map(message => ({
      id: message.id,
      title: message.title,
      description: message.description,
      publisherName: message.publisher_name,
      contactPhone: message.contact_phone,
      userId: message.user_id,
      createdAt: new Date(message.created_at),
      updatedAt: new Date(message.updated_at)
    }))

    // Get total count for pagination
    let countQuery = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    if (query && query.trim()) {
      countQuery = countQuery.or(buildSearchQuery(query))
    }

    const { count } = await countQuery

    return NextResponse.json({
      messages: responseMessages,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}