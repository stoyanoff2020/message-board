# Docker Deployment Guide

This guide covers how to deploy the Message Board application using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## Quick Start

1. **Clone the repository and navigate to the project directory**
2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Start the application:**
   ```bash
   # Development mode
   npm run docker:dev

   # Production mode
   npm run docker:prod
   ```

4. **Access the application at http://localhost:3000**

## Docker Commands

### Using npm scripts (recommended):

```bash
# Start development environment
npm run docker:dev

# Start production environment
npm run docker:prod

# Stop services
npm run docker:stop

# View logs
npm run docker:logs

# Check health
npm run docker:health

# Clean up resources
npm run docker:cleanup
```

### Using the setup script directly:

```bash
# Start services
./scripts/docker-setup.sh start [dev|prod]

# Stop services
./scripts/docker-setup.sh stop [dev|prod]

# View logs
./scripts/docker-setup.sh logs [dev|prod]

# Restart services
./scripts/docker-setup.sh restart [dev|prod]

# Health check
./scripts/docker-setup.sh health

# Clean up
./scripts/docker-setup.sh cleanup
```

### Using docker-compose directly:

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build

# With nginx reverse proxy
docker-compose --profile production up --build
```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Docker Environment Variables

Additional environment variables for Docker deployment:

```env
# Node environment
NODE_ENV=production

# Port configuration (optional)
PORT=3000
HOSTNAME=0.0.0.0
```

## Architecture

### Multi-stage Build

The production Dockerfile uses a multi-stage build process:

1. **deps**: Install production dependencies
2. **builder**: Build the Next.js application
3. **runner**: Create the final runtime image

This approach minimizes the final image size and improves security.

### Development vs Production

- **Development**: Hot reloading, all dependencies, volume mounts
- **Production**: Optimized build, minimal dependencies, standalone output

## Services

### message-board (Main Application)

- **Port**: 3000
- **Health Check**: `/api/health`
- **Restart Policy**: unless-stopped
- **Logging**: JSON format with rotation

### nginx (Reverse Proxy) - Optional

- **Ports**: 80, 443
- **Features**: Rate limiting, compression, security headers
- **Profile**: production (only starts with `--profile production`)

## Health Checks

The application includes comprehensive health checks:

- **Docker Health Check**: Built into the container
- **API Endpoint**: `GET /api/health`
- **Nginx Health Check**: Proxied to application health endpoint

Health check response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Logging

### Application Logs

- **Format**: JSON structured logging
- **Rotation**: 10MB max size, 3 files retained
- **Location**: Docker logs (accessible via `docker logs`)

### Nginx Logs

- **Access Logs**: Standard nginx format
- **Error Logs**: Nginx error format
- **Health Check**: Access logs disabled for `/health`

## Security Features

### Container Security

- **Non-root user**: Application runs as `nextjs` user (UID 1001)
- **Minimal base image**: Alpine Linux
- **Read-only filesystem**: Where possible
- **No unnecessary packages**: Multi-stage build removes build dependencies

### Nginx Security

- **Rate Limiting**: API endpoints limited to 10 req/s, auth endpoints to 5 req/m
- **Security Headers**: X-Frame-Options, X-XSS-Protection, CSP, etc.
- **Gzip Compression**: Reduces bandwidth usage
- **Static File Caching**: Optimizes performance

## Performance Optimization

### Build Optimization

- **Output File Tracing**: Next.js standalone output
- **Layer Caching**: Optimized Dockerfile layer order
- **Multi-stage Build**: Minimal runtime image

### Runtime Optimization

- **Static File Caching**: 1-year cache for static assets
- **Gzip Compression**: Reduces response sizes
- **Connection Pooling**: Nginx upstream configuration

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Stop the service or use a different port
   ```

2. **Environment variables not loaded**:
   ```bash
   # Verify .env.local exists and has correct values
   cat .env.local
   ```

3. **Health check failing**:
   ```bash
   # Check application logs
   npm run docker:logs
   # Test health endpoint directly
   curl http://localhost:3000/api/health
   ```

4. **Build failures**:
   ```bash
   # Clean up and rebuild
   npm run docker:cleanup
   npm run docker:prod
   ```

### Debugging

```bash
# Enter running container
docker exec -it <container_name> sh

# View detailed logs
docker-compose logs -f --tail=100

# Check container resource usage
docker stats

# Inspect container configuration
docker inspect <container_name>
```

## Production Deployment

### With Nginx Reverse Proxy

```bash
# Start with nginx
docker-compose --profile production up -d

# SSL certificates (place in ./ssl/ directory)
# - certificate.crt
# - private.key
```

### Environment-specific Configurations

Create environment-specific compose files:

```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  message-board:
    environment:
      - NODE_ENV=staging
    # staging-specific overrides
```

### Monitoring

- **Health Checks**: Built-in Docker health checks
- **Logs**: Structured JSON logging with rotation
- **Metrics**: Can be extended with monitoring solutions

## Maintenance

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run docker:stop
npm run docker:prod
```

### Backup

```bash
# Backup environment configuration
cp .env.local .env.local.backup

# Export container logs if needed
docker logs <container_name> > app.log
```

### Cleanup

```bash
# Remove unused Docker resources
npm run docker:cleanup

# Remove all containers and images (careful!)
docker system prune -a
```