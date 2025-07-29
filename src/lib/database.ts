import { supabase, supabaseAdmin, Database } from './supabase'

// Type definitions for our models
export type User = Database['public']['Tables']['users']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

// User operations
export const userOperations = {
  // Get user by ID
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Create user (admin only)
  async create(user: UserInsert): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update user
  async update(id: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all users (admin only)
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Message operations
export const messageOperations = {
  // Get all messages with optional search
  async getAll(searchTerm?: string): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get messages with full-text search
  async search(searchTerm: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`title.fts.${searchTerm},description.fts.${searchTerm}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get message by ID
  async getById(id: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Create message
  async create(message: MessageInsert): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update message
  async update(id: string, updates: MessageUpdate): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete message
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get messages by user ID
  async getByUserId(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Admin operations
export const adminOperations = {
  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update user status (admin only)
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete message (admin only)
  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get all messages (admin only)
  async getAllMessages(): Promise<Message[]> {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}