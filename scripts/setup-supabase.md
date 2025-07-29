# Supabase Setup Guide

This guide will help you set up Supabase for the message board application.

## Prerequisites

1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Create a Supabase account: https://supabase.com

## Setup Steps

### 1. Create a new Supabase project

```bash
# Login to Supabase
supabase login

# Initialize the project (if not already done)
supabase init

# Start local development environment
supabase start
```

### 2. Apply database migrations

```bash
# Apply the initial schema migration
supabase db reset

# Or apply migrations manually
supabase db push
```

### 3. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Update the following variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

### 4. Configure Authentication

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Set Site URL to `http://localhost:3000` (for development)
3. Add redirect URLs as needed
4. Configure email templates if desired

### 5. Create an admin user (optional)

After setting up authentication, you can manually create an admin user by:

1. Register a normal user through the application
2. In Supabase dashboard, go to Table Editor > users
3. Find your user and set `is_admin` to `true`

## Database Schema Overview

The application uses two main tables:

### Users Table
- `id`: UUID primary key
- `email`: Unique email address
- `name`: User's display name
- `is_admin`: Boolean flag for admin privileges
- `is_active`: Boolean flag for account status
- `created_at`, `updated_at`: Timestamps

### Messages Table
- `id`: UUID primary key
- `title`: Message title
- `description`: Message content
- `publisher_name`: Name of the message publisher
- `contact_phone`: Contact phone number
- `user_id`: Foreign key to users table
- `created_at`, `updated_at`: Timestamps

## Row Level Security (RLS)

The database uses RLS policies to ensure data security:

- Users can only read/update their own profile
- Admins can read/update all users
- Anyone can read messages (public message board)
- Only authenticated users can create messages
- Users can update/delete their own messages
- Admins can delete any message

## Search Optimization

The database includes GIN indexes for full-text search on:
- Message titles
- Message descriptions

Additional indexes for performance:
- Messages by creation date
- Messages by user ID
- Users by email
- Admin users

## Troubleshooting

### Common Issues

1. **Migration fails**: Make sure you have the latest Supabase CLI version
2. **RLS policies not working**: Check that RLS is enabled on tables
3. **Search not working**: Ensure GIN indexes are created properly
4. **Auth issues**: Verify environment variables are set correctly

### Useful Commands

```bash
# Check migration status
supabase migration list

# Reset database (careful - this deletes all data)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# View logs
supabase logs

# Stop local environment
supabase stop
```

## Production Deployment

For production deployment:

1. Create a production Supabase project
2. Update environment variables with production URLs and keys
3. Run migrations on production database
4. Configure proper authentication settings
5. Set up proper CORS and security settings