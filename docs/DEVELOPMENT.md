# Development Environment Setup Guide

This guide will help you set up a complete development environment for the Message Board application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Development Workflow](#development-workflow)
5. [Testing Setup](#testing-setup)
6. [Code Quality Tools](#code-quality-tools)
7. [Debugging](#debugging)
8. [Common Development Tasks](#common-development-tasks)

## Prerequisites

### Required Software

1. **Node.js** (18.0 or higher)
   ```bash
   # Check version
   node --version
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **npm** (9.0 or higher)
   ```bash
   # Check version
   npm --version
   
   # Update npm
   npm install -g npm@latest
   ```

3. **Git**
   ```bash
   # Check version
   git --version
   
   # Configure Git (if not already done)
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

4. **Docker** (optional, for containerized development)
   - Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Verify installation: `docker --version`

### Recommended Tools

1. **Visual Studio Code** with extensions:
   - TypeScript and JavaScript Language Features
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - Prettier - Code formatter
   - ESLint
   - GitLens

2. **Browser Developer Tools**
   - Chrome DevTools (recommended)
   - React Developer Tools extension
   - Redux DevTools extension (if using Redux)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd message-board

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit environment variables
nano .env.local  # or use your preferred editor
```

Required environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Development Settings (optional)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Verify Setup

```bash
# Run development server
npm run dev

# In another terminal, run tests
npm test

# Check linting
npm run lint
```

## Database Configuration

### 1. Supabase Setup

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Create a new project

2. **Get Project Credentials**
   - Go to Project Settings > API
   - Copy the Project URL and anon public key
   - Copy the service_role secret key

3. **Run Database Migration**
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL script

### 2. Local Database (Alternative)

If you prefer local development with Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

### 3. Database Verification

```bash
# Test database connection
npm run dev

# Navigate to http://localhost:3000
# Try registering a new user
# Verify user appears in Supabase dashboard
```

## Development Workflow

### 1. Starting Development

```bash
# Start development server
npm run dev

# Server will start at http://localhost:3000
# Hot reloading is enabled for code changes
```

### 2. Making Changes

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Code Changes**
   - Edit files in `src/` directory
   - Follow TypeScript best practices
   - Use existing component patterns

3. **Test Changes**
   ```bash
   # Run unit tests
   npm test
   
   # Run E2E tests
   npm run e2e
   
   # Check types
   npx tsc --noEmit
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

### 3. Code Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   ├── admin/             # Admin pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # Base UI components
│   ├── auth/              # Auth components
│   ├── messages/          # Message components
│   └── layout/            # Layout components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
└── types/                 # TypeScript definitions
```

## Testing Setup

### 1. Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run specific test file
npm test -- auth.test.ts

# Run tests with coverage
npm run test:coverage
```

### 2. End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Run specific E2E test
npx playwright test auth.spec.ts
```

### 3. Writing Tests

**Unit Test Example:**
```typescript
// src/components/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

**E2E Test Example:**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can register and login', async ({ page }) => {
  await page.goto('/register')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.fill('[name="name"]', 'Test User')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/')
})
```

## Code Quality Tools

### 1. ESLint Configuration

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Check specific files
npx eslint src/components/ui/button.tsx
```

### 2. Prettier Configuration

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Format specific files
npx prettier --write src/components/ui/button.tsx
```

### 3. TypeScript

```bash
# Type checking
npx tsc --noEmit

# Watch mode for type checking
npx tsc --noEmit --watch
```

### 4. Pre-commit Hooks (Optional)

```bash
# Install husky for git hooks
npm install --save-dev husky

# Set up pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run format:check && npm run test:run"
```

## Debugging

### 1. Browser Debugging

1. **React Developer Tools**
   - Install browser extension
   - Inspect component props and state
   - Profile component performance

2. **Network Tab**
   - Monitor API requests
   - Check request/response data
   - Debug authentication issues

3. **Console Debugging**
   ```typescript
   // Add debug logs
   console.log('Debug data:', data)
   console.error('Error occurred:', error)
   
   // Use debugger statement
   debugger;
   ```

### 2. Server-Side Debugging

```bash
# Enable debug mode
DEBUG=* npm run dev

# Debug specific modules
DEBUG=supabase:* npm run dev
```

### 3. Database Debugging

1. **Supabase Dashboard**
   - Check table data
   - Monitor real-time subscriptions
   - View logs and metrics

2. **SQL Debugging**
   ```sql
   -- Test queries in Supabase SQL editor
   SELECT * FROM messages WHERE title ILIKE '%search%';
   ```

## Common Development Tasks

### 1. Adding New Components

```bash
# Create component file
touch src/components/ui/new-component.tsx

# Create test file
touch src/components/ui/__tests__/new-component.test.tsx

# Create story file (if using Storybook)
touch src/components/ui/new-component.stories.tsx
```

### 2. Adding New API Routes

```bash
# Create API route
mkdir -p src/app/api/new-endpoint
touch src/app/api/new-endpoint/route.ts

# Create test file
touch src/app/api/new-endpoint/__tests__/route.test.ts
```

### 3. Database Schema Changes

```bash
# Create new migration file
touch supabase/migrations/002_new_migration.sql

# Apply migration in Supabase dashboard
# Or use Supabase CLI: supabase db push
```

### 4. Adding Dependencies

```bash
# Add runtime dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### 5. Environment-Specific Configuration

```bash
# Development environment
cp .env.local.example .env.local

# Staging environment
cp .env.local.example .env.staging

# Production environment
cp .env.local.example .env.production
```

## Performance Monitoring

### 1. Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check for unused dependencies
npx depcheck
```

### 2. Performance Profiling

```typescript
// Use React Profiler
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component render time:', actualDuration)
}

<Profiler id="MessageList" onRender={onRenderCallback}>
  <MessageList />
</Profiler>
```

### 3. Lighthouse Audits

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## Troubleshooting Development Issues

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   
   # Or use different port
   PORT=3001 npm run dev
   ```

2. **Node Modules Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Errors**
   ```bash
   # Restart TypeScript server in VS Code
   # Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
   
   # Check TypeScript version
   npx tsc --version
   ```

4. **Environment Variable Issues**
   ```bash
   # Verify environment variables are loaded
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
   
   # Restart development server after changing .env.local
   ```

### Getting Help

1. **Check Documentation**
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Supabase Documentation](https://supabase.com/docs)
   - [React Documentation](https://react.dev)

2. **Debug Tools**
   - Browser Developer Tools
   - React Developer Tools
   - Next.js built-in error overlay

3. **Community Resources**
   - Stack Overflow
   - GitHub Issues
   - Discord/Slack communities

---

*For deployment instructions, see [Docker Guide](DOCKER.md). For user documentation, see [User Guide](USER_GUIDE.md).*