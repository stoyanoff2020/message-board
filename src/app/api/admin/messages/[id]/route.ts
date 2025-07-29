import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
import { isAdminServer } from '@/lib/auth'

/**
 * DELETE /api/admin/messages/[id] - Delete a specific message (admin only)
 */
export async function DELETE(
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

    const messageId = params.id

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // First, check if the message exists
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('id, title, publisher_name')
      .eq('id', messageId)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
      deletedMessage: {
        id: existingMessage.id,
        title: existingMessage.title,
        publisherName: existingMessage.publisher_name
      }
    })

  } catch (error) {
    console.error('Admin delete message API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/messages/[id] - Get a specific message details (admin only)
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

    const messageId = params.id

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // Fetch the message with user details
    const { data: message, error } = await supabase
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
        users(
          id,
          name,
          email,
          is_active,
          is_admin
        )
      `)
      .eq('id', messageId)
      .single()

    if (error || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Transform the data to match our Message interface
    const transformedMessage = {
      id: message.id,
      title: message.title,
      description: message.description,
      publisherName: message.publisher_name,
      contactPhone: message.contact_phone,
      userId: message.user_id,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      user: {
        id: (message.users as any)?.id,
        name: (message.users as any)?.name,
        email: (message.users as any)?.email,
        isActive: (message.users as any)?.is_active,
        isAdmin: (message.users as any)?.is_admin
      }
    }

    return NextResponse.json({
      message: transformedMessage
    })

  } catch (error) {
    console.error('Admin get message API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}