# Message Board Application

A modern, full-stack message board application built with Next.js, TypeScript, and Supabase. Users can register, authenticate, publish messages, and search through content with a comprehensive admin panel for content management.

## 🚀 Features

- **User Authentication**: Secure registration and login with Supabase Auth
- **Message Publishing**: Create and publish messages with contact information
- **Real-time Search**: Full-text search across message titles and descriptions
- **Admin Panel**: Comprehensive admin interface for user and content management
- **Responsive Design**: Mobile-first design with shadcn/ui components
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Testing**: Comprehensive unit, integration, and E2E test coverage
- **Docker Support**: Containerized deployment with Docker and Docker Compose

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **ORM**: Supabase Client

### Development & Testing
- **Testing Framework**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript

### Deployment
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (optional)
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher
- **Docker**: 20.10+ (for containerized deployment)
- **Docker Compose**: 2.0+ (for containerized deployment)
- **Supabase Account**: For database and authentication

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd message-board
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the migration script in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of supabase/migrations/001_initial_schema.sql
   ```

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`.

## 🐳 Docker Deployment

### Quick Docker Start

```bash
# Development environment
npm run docker:dev

# Production environment
npm run docker:prod
```

### Manual Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build

# With Nginx reverse proxy
docker-compose --profile production up --build
```

For detailed Docker deployment instructions, see [Docker Guide](docs/DOCKER.md).

## 📚 Documentation

- **[User Guide](docs/USER_GUIDE.md)**: Complete guide for end users
- **[Admin Guide](docs/ADMIN_GUIDE.md)**: Administrative features and management
- **[Docker Deployment](docs/DOCKER.md)**: Containerized deployment guide
- **[Troubleshooting](docs/TROUBLESHOOTING.md)**: Common issues and solutions
- **[FAQ](docs/FAQ.md)**: Frequently asked questions

## 🧪 Testing

### Unit and Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### End-to-End Tests

```bash
# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui
```

## 🏗 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/               # API endpoints
│   │   │   ├── auth/          # Authentication routes
│   │   │   ├── messages/      # Message CRUD operations
│   │   │   └── admin/         # Admin-only routes
│   │   ├── admin/             # Admin panel pages
│   │   ├── login/             # Authentication pages
│   │   └── register/
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── messages/          # Message-related components
│   │   ├── admin/             # Admin panel components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript type definitions
│   └── __tests__/             # Test files
├── docs/                      # Documentation
├── e2e/                       # End-to-end tests
├── supabase/                  # Database migrations and schema
├── scripts/                   # Deployment and setup scripts
└── docker-compose*.yml       # Docker configuration
```

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start              # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run format:check   # Check code formatting

# Testing
npm test              # Run unit/integration tests
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage
npm run e2e          # Run E2E tests

# Docker
npm run docker:dev    # Start development Docker environment
npm run docker:prod   # Start production Docker environment
npm run docker:stop   # Stop Docker services
npm run docker:logs   # View Docker logs
npm run docker:health # Check Docker health
npm run docker:cleanup # Clean up Docker resources
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Messages
- `GET /api/messages` - Fetch messages (with optional search)
- `POST /api/messages` - Create new message

### Admin (Admin Only)
- `GET /api/admin/users` - Fetch all users
- `PUT /api/admin/users/[id]` - Update user status
- `GET /api/admin/messages` - Fetch all messages
- `DELETE /api/admin/messages/[id]` - Delete message

### System
- `GET /api/health` - Health check endpoint

For detailed API documentation, see the [API Reference](#api-reference) section below.

## 🗄 Database Schema

### Users Table
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

### Messages Table
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

### Key Features
- **Row Level Security (RLS)**: Implemented for data protection
- **Full-text Search**: Optimized indexes for search functionality
- **Automatic Timestamps**: Created/updated timestamps with triggers
- **User Profile Integration**: Automatic user profile creation from auth

## 🔒 Security Features

- **Authentication**: Secure JWT-based authentication via Supabase
- **Authorization**: Role-based access control (admin/user roles)
- **Input Validation**: Server-side validation with Zod schemas
- **SQL Injection Protection**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Next.js built-in CSRF protection
- **Row Level Security**: Database-level access control

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Database Indexing**: Optimized indexes for search and queries
- **Caching**: Browser caching for static assets
- **Compression**: Gzip compression in production
- **Bundle Optimization**: Tree shaking and dynamic imports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Update documentation as needed

## 📝 API Reference

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isAdmin": false,
    "isActive": true
  }
}
```

#### POST /api/auth/login
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isAdmin": false,
    "isActive": true
  }
}
```

### Message Endpoints

#### GET /api/messages
Fetch messages with optional search and pagination.

**Query Parameters:**
- `query` (optional): Search term
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `orderBy` (optional): Sort field (default: created_at)
- `orderDirection` (optional): Sort direction (default: desc)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "title": "Message Title",
      "description": "Message description",
      "publisherName": "John Doe",
      "contactPhone": "(555) 123-4567",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

#### POST /api/messages
Create a new message (requires authentication).

**Request Body:**
```json
{
  "title": "Message Title",
  "description": "Detailed message description",
  "contactPhone": "555-123-4567"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "title": "Message Title",
    "description": "Detailed message description",
    "publisherName": "John Doe",
    "contactPhone": "(555) 123-4567",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🐛 Troubleshooting

For common issues and solutions, see the [Troubleshooting Guide](docs/TROUBLESHOOTING.md).

### Quick Fixes

**Application won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database connection issues:**
```bash
# Verify environment variables
cat .env.local
# Check Supabase project status
```

**Docker issues:**
```bash
# Clean up Docker resources
npm run docker:cleanup
# Rebuild containers
npm run docker:prod
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [React Hook Form](https://react-hook-form.com/) - Form library
- [Zod](https://zod.dev/) - Schema validation

---

For additional help and documentation, see the [docs](docs/) directory or contact your system administrator.