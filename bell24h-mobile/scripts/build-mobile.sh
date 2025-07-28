#!/bin/bash

# Bell24H Mobile App Build and Deployment Script
# This script handles building and deploying the mobile app

set -e  # Exit on any error

echo "📱 Starting Bell24H Mobile App Build and Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="bell24h-mobile"
BUILD_TYPE="${1:-development}"
PLATFORM="${2:-all}"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-build checks
print_status "Running pre-build checks..."

# Check Node.js version
if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm
if ! command_exists npm; then
    print_error "npm is not installed"
    exit 1
fi

# Check Expo CLI
if ! command_exists expo; then
    print_warning "Expo CLI not found, installing..."
    npm install -g @expo/cli
fi

# Check EAS CLI for production builds
if [ "$BUILD_TYPE" = "production" ] && ! command_exists eas; then
    print_warning "EAS CLI not found, installing..."
    npm install -g @expo/eas-cli
fi

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Environment setup
print_status "Setting up environment..."

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning ".env file not found, creating from template..."
    cat > .env << EOF
# Bell24H Mobile App Environment Variables
API_BASE_URL=https://your-api-domain.com
EXPO_PROJECT_ID=your-expo-project-id
SENTRY_DSN=your-sentry-dsn
ANALYTICS_KEY=your-analytics-key
EOF
    print_warning "Please configure .env with your actual values"
fi

# Validate environment variables
print_status "Validating environment variables..."
source .env

REQUIRED_VARS=(
    "API_BASE_URL"
    "EXPO_PROJECT_ID"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "Required environment variable $var is not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Type checking
print_status "Running TypeScript type checking..."
npx tsc --noEmit
print_success "Type checking passed"

# Linting
print_status "Running ESLint..."
npx eslint . --ext .ts,.tsx
print_success "Linting passed"

# Testing
print_status "Running tests..."
npm test -- --passWithNoTests
print_success "Tests passed"

# Build based on type and platform
case "$BUILD_TYPE" in
    "development")
        print_status "Building for development..."
        
        case "$PLATFORM" in
            "ios")
                print_status "Starting iOS development build..."
                expo start --ios
                ;;
            "android")
                print_status "Starting Android development build..."
                expo start --android
                ;;
            "web")
                print_status "Starting web development build..."
                expo start --web
                ;;
            "all"|*)
                print_status "Starting development server for all platforms..."
                expo start
                ;;
        esac
        ;;
        
    "staging")
        print_status "Building for staging..."
        
        # Configure for staging
        sed -i 's/API_BASE_URL=.*/API_BASE_URL=https:\/\/staging-api.bell24h.com/' .env
        
        case "$PLATFORM" in
            "ios")
                eas build --platform ios --profile staging
                ;;
            "android")
                eas build --platform android --profile staging
                ;;
            "all"|*)
                eas build --platform all --profile staging
                ;;
        esac
        ;;
        
    "production")
        print_status "Building for production..."
        
        # Configure for production
        sed -i 's/API_BASE_URL=.*/API_BASE_URL=https:\/\/api.bell24h.com/' .env
        
        case "$PLATFORM" in
            "ios")
                eas build --platform ios --profile production
                ;;
            "android")
                eas build --platform android --profile production
                ;;
            "all"|*)
                eas build --platform all --profile production
                ;;
        esac
        ;;
        
    *)
        print_error "Invalid build type. Use: development, staging, or production"
        exit 1
        ;;
esac

# Post-build steps for production
if [ "$BUILD_TYPE" = "production" ]; then
    print_status "Running post-production build steps..."
    
    # Generate app store assets
    print_status "Generating app store assets..."
    npx expo-asset-generator
    
    # Update app store metadata
    print_status "Updating app store metadata..."
    # Add your app store metadata update logic here
    
    print_success "Production build completed!"
    
    echo ""
    echo "🎉 Bell24H Mobile App Production Build Complete!"
    echo ""
    echo "📊 Build Summary:"
    echo "   - Build Type: $BUILD_TYPE"
    echo "   - Platform: $PLATFORM"
    echo "   - Environment: Production"
    echo ""
    echo "📱 Next Steps:"
    echo "   1. Submit to App Store Connect (iOS)"
    echo "   2. Submit to Google Play Console (Android)"
    echo "   3. Configure app store metadata"
    echo "   4. Set up app store analytics"
    echo "   5. Configure crash reporting"
    echo ""
else
    print_success "Development build completed!"
    echo ""
    echo "🚀 Bell24H Mobile App is ready for development!"
    echo ""
    echo "📱 Available commands:"
    echo "   - npm run ios     # Run on iOS simulator"
    echo "   - npm run android # Run on Android emulator"
    echo "   - npm run web     # Run in web browser"
    echo ""
fi 