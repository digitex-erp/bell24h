#!/bin/bash

# Script to switch between production (PostgreSQL) and local (SQLite) database schemas

echo "🔧 Bell24h Database Schema Switcher"
echo "===================================="
echo ""

if [ "$1" == "local" ]; then
    echo "🔄 Switching to LOCAL SQLite schema..."
    cp prisma/schema.sqlite.prisma prisma/schema.prisma
    echo "✅ Switched to SQLite schema"
    echo ""
    echo "Next steps:"
    echo "1. Update .env.local with DATABASE_URL=\"file:./dev.db\""
    echo "2. Run: npm run db:generate"
    echo "3. Run: npm run db:push"
    echo "4. Run: npm run db:seed:local"
    
elif [ "$1" == "production" ]; then
    echo "🔄 Switching to PRODUCTION PostgreSQL schema..."
    cp prisma/schema.postgresql.prisma prisma/schema.prisma 2>/dev/null || echo "⚠️  Production schema not found. Please restore from backup."
    echo "✅ Switched to PostgreSQL schema"
    echo ""
    echo "Next steps:"
    echo "1. Update .env with Neon PostgreSQL DATABASE_URL"
    echo "2. Run: npm run db:generate"
    echo "3. Run: npm run db:migrate"
    echo "4. Run: npm run db:seed:comprehensive"
    
else
    echo "❌ Usage: $0 [local|production]"
    echo ""
    echo "Examples:"
    echo "  $0 local      # Switch to SQLite for local development"
    echo "  $0 production # Switch to PostgreSQL for production"
fi