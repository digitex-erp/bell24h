#!/bin/bash
# Bell24H Application Runner Script
# This script provides an easy way to run the Bell24H application in different environments

# Text styling
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# Print header
echo -e "${BOLD}${BLUE}Bell24H Marketplace Application Runner${NC}"
echo "--------------------------------------"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js v18 or later: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Warning: Node.js version ${NODE_VERSION} detected${NC}"
    echo -e "Bell24H recommends Node.js v18 or later. You may experience issues."
    echo ""
fi

# Check for .env file
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}Warning: No .env file found, but .env.example exists${NC}"
        echo -e "Would you like to create a .env file from .env.example? [y/N]"
        read -r answer
        if [[ "$answer" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            cp .env.example .env
            echo -e "${GREEN}Created .env file from template.${NC}"
            echo -e "${YELLOW}Please edit .env file to set your environment variables.${NC}"
            exit 0
        fi
    else
        echo -e "${YELLOW}Warning: No .env or .env.example file found${NC}"
        echo "Environment variables may need to be set manually."
    fi
fi

# Function to check if a package is installed
is_package_installed() {
    npm list --depth=0 2>/dev/null | grep -q " $1@"
    return $?
}

# Ensure required packages are installed
echo -e "${BLUE}Checking dependencies...${NC}"
missing_packages=()

if ! is_package_installed "express"; then missing_packages+=("express"); fi
if ! is_package_installed "drizzle-orm"; then missing_packages+=("drizzle-orm"); fi
if ! is_package_installed "react"; then missing_packages+=("react"); fi

if [ ${#missing_packages[@]} -gt 0 ]; then
    echo -e "${YELLOW}Some dependencies appear to be missing. Running npm install...${NC}"
    npm install
fi

# Function to display menu
show_menu() {
    echo ""
    echo -e "${BOLD}Select an option:${NC}"
    echo "1) Start development server"
    echo "2) Build for production"
    echo "3) Start production server"
    echo "4) Check database connection"
    echo "5) Push schema to database"
    echo "6) Package for deployment"
    echo "7) Exit"
    echo ""
    echo -n "Enter option [1-7]: "
}

# Handle menu selection
handle_selection() {
    case $1 in
        1)
            echo -e "${GREEN}Starting development server...${NC}"
            NODE_ENV=development npx tsx server/index.ts
            ;;
        2)
            echo -e "${GREEN}Building for production...${NC}"
            npm run build
            ;;
        3)
            echo -e "${GREEN}Starting production server...${NC}"
            NODE_ENV=production node dist/index.js
            ;;
        4)
            echo -e "${GREEN}Checking database connection...${NC}"
            # Extract database details from DATABASE_URL
            if [ -f .env ]; then
                source <(grep ^DATABASE_URL .env | sed 's/^/export /')
            fi
            
            if [ -z "$DATABASE_URL" ]; then
                echo -e "${RED}Error: DATABASE_URL not set${NC}"
                echo "Please check your .env file"
                return
            fi
            
            # Simple connection test
            echo "Connecting to database..."
            node -e "
                const { Pool } = require('@neondatabase/serverless');
                const pool = new Pool({ connectionString: process.env.DATABASE_URL });
                pool.query('SELECT NOW()')
                    .then(res => { 
                        console.log('\x1b[32mConnection successful!\x1b[0m');
                        console.log('Server time:', res.rows[0].now);
                        pool.end();
                    })
                    .catch(err => { 
                        console.error('\x1b[31mConnection failed:\x1b[0m', err.message);
                        process.exit(1);
                    });
            "
            ;;
        5)
            echo -e "${GREEN}Pushing schema to database...${NC}"
            npx drizzle-kit push
            ;;
        6)
            echo -e "${GREEN}Packaging for deployment...${NC}"
            node package-for-deployment.js
            ;;
        7)
            echo -e "${BLUE}Exiting. Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option. Please try again.${NC}"
            ;;
    esac
}

# Main loop
if [ "$#" -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        read -r selection
        handle_selection "$selection"
        echo ""
        echo -e "${YELLOW}Press Enter to continue...${NC}"
        read -r
    done
else
    # Command-line mode
    case $1 in
        dev)
            handle_selection 1
            ;;
        build)
            handle_selection 2
            ;;
        start)
            handle_selection 3
            ;;
        db:check)
            handle_selection 4
            ;;
        db:push)
            handle_selection 5
            ;;
        package)
            handle_selection 6
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo "Available commands: dev, build, start, db:check, db:push, package"
            exit 1
            ;;
    esac
fi