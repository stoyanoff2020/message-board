# Supabase Configuration

This directory contains all the Supabase configuration files for the message board application.

## Files Overview

- `config.toml` - Supabase project configuration
- `schema.sql` - Complete database schema with tables, indexes, and RLS policies
- `migrations/001_initial_schema.sql` - Initial migration file
- `README.md` - This documentation file

## Database Schema

### Tables

#### Users Table
Stores user account information and admin privileges.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Messages Table
Stores message board posts with contact information.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  publisher_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes

The schema includes several indexes for optimal performance:

1. **Full-text search indexes** (GIN):
   - `idx_messages_title` - For searching message titles
   - `idx_messages_description` - For searching message descriptions

2. **Performance indexes**:
   - `idx_messages_created_at` - For ordering messages by date
   - `idx_messages_user_id` - For filtering messages by user
   - `idx_users_email` - For user lookup by email
   - `idx_users_is_admin` - For admin user queries

### Row Level Security (RLS)

The database uses RLS policies to ensure data security:

#### Users Table Policies
- **Users can read own profile**: Users can only access their own user data
- **Users can update own profile**: Users can only modify their own profile
- **Admins can read all users**: Admin users can access all user data
- **Admins can update users**: Admin users can modify any user account

#### Messages Table Policies
- **Anyone can read messages**: Public access to all messages (message board is public)
- **Authenticated users can insert messages**: Only logged-in users can create messages
- **Users can update own messages**: Users can only edit their own messages
- **Users can delete own messages**: Users can only delete their own messages
- **Admins can delete any message**: Admin users can delete any message for moderation

### Triggers and Functions

#### Auto-update Timestamps
- `update_updated_at_column()` function automatically updates the `updated_at` field
- Triggers on both `users` and `messages` tables ensure timestamps are maintained

#### User Profile Creation
- `handle_new_user()` function automatically creates a user profile when a new auth user is created
- Triggered by the `on_auth_user_created` trigger on the `auth.users` table

## Authentication Configuration

The Supabase Auth is configured with:

- **Email/Password authentication** enabled
- **User registration** enabled
- **Email confirmation** disabled for development (can be enabled for production)
- **JWT expiry** set to 1 hour
- **Refresh token rotation** enabled for security

## Environment Variables

The application requires these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Local Development

To set up local development:

1. Install Supabase CLI
2. Run `supabase start` to start local services
3. Apply migrations with `supabase db reset`
4. Configure environment variables

## Production Deployment

For production:

1. Create a Supabase project
2. Apply migrations to production database
3. Configure authentication settings
4. Update environment variables
5. Set up proper CORS and security settings

## Security Considerations

1. **RLS Policies**: All tables have RLS enabled with appropriate policies
2. **Admin Access**: Admin operations use service role key for elevated permissions
3. **Input Validation**: All user inputs are validated both client and server-side
4. **Phone Number Validation**: Contact phone numbers are validated for proper format
5. **Search Security**: Full-text search uses parameterized queries to prevent injection

## Performance Optimizations

1. **Search Indexes**: GIN indexes for fast full-text search
2. **Query Optimization**: Proper indexes on frequently queried columns
3. **Connection Pooling**: Supabase handles connection pooling automatically
4. **Caching**: Client-side caching of frequently accessed data