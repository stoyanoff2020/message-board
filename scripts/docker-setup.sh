#!/bin/bash

# Docker setup script for message board application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed."
}

# Check if .env.local exists
check_env() {
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found."
        print_status "Creating .env.local from .env.local.example..."
        
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            print_warning "Please update .env.local with your actual Supabase credentials."
        else
            print_error ".env.local.example not found. Please create .env.local manually."
            exit 1
        fi
    else
        print_status ".env.local file exists."
    fi
}

# Build and start services
start_services() {
    local mode=$1
    
    if [ "$mode" = "dev" ]; then
        print_status "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up --build -d
    elif [ "$mode" = "prod" ]; then
        print_status "Starting production environment..."
        docker-compose up --build -d
    else
        print_error "Invalid mode. Use 'dev' or 'prod'."
        exit 1
    fi
}

# Stop services
stop_services() {
    local mode=$1
    
    if [ "$mode" = "dev" ]; then
        print_status "Stopping development environment..."
        docker-compose -f docker-compose.dev.yml down
    elif [ "$mode" = "prod" ]; then
        print_status "Stopping production environment..."
        docker-compose down
    else
        docker-compose down
        docker-compose -f docker-compose.dev.yml down
    fi
}

# Show logs
show_logs() {
    local mode=$1
    
    if [ "$mode" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down --volumes --remove-orphans
    docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
    docker system prune -f
    print_status "Cleanup completed."
}

# Main script logic
case "$1" in
    "start")
        check_docker
        check_env
        start_services "${2:-prod}"
        print_status "Services started successfully!"
        print_status "Application should be available at http://localhost:3000"
        ;;
    "stop")
        stop_services "$2"
        print_status "Services stopped."
        ;;
    "logs")
        show_logs "$2"
        ;;
    "restart")
        stop_services "$2"
        start_services "${2:-prod}"
        print_status "Services restarted."
        ;;
    "cleanup")
        cleanup
        ;;
    "health")
        print_status "Checking application health..."
        curl -f http://localhost:3000/api/health || print_error "Health check failed"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|logs|cleanup|health} [dev|prod]"
        echo ""
        echo "Commands:"
        echo "  start [dev|prod]  - Start the application (default: prod)"
        echo "  stop [dev|prod]   - Stop the application"
        echo "  restart [dev|prod] - Restart the application"
        echo "  logs [dev|prod]   - Show application logs"
        echo "  cleanup           - Clean up Docker resources"
        echo "  health            - Check application health"
        echo ""
        echo "Examples:"
        echo "  $0 start dev      - Start in development mode"
        echo "  $0 start prod     - Start in production mode"
        echo "  $0 logs dev       - Show development logs"
        exit 1
        ;;
esac