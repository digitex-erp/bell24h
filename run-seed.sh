#!/bin/bash
# Bell24h Database Seeding Run Script
# This script provides all the commands needed to seed your database

echo "🌱 Bell24h Database Seeding Setup"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm detected"
echo ""

# 1. Install dependencies (if needed)
echo "📦 Step 1: Installing dependencies..."
echo "Command: npm install"
echo ""
read -p "Do you want to install dependencies? (y/n): " install_deps
if [[ $install_deps == "y" || $install_deps == "Y" ]]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "⏭️  Skipping dependency installation"
fi
echo ""

# 2. Run Prisma migrations (if needed)
echo "🗄️  Step 2: Database setup..."
echo "Command: npx prisma generate"
echo ""
read -p "Do you want to generate Prisma client? (y/n): " generate_prisma
if [[ $generate_prisma == "y" || $generate_prisma == "Y" ]]; then
    npx prisma generate
    echo "✅ Prisma client generated"
else
    echo "⏭️  Skipping Prisma client generation"
fi
echo ""

read -p "Do you want to push schema to database? (y/n): " push_schema
if [[ $push_schema == "y" || $push_schema == "Y" ]]; then
    echo "Command: npx prisma db push"
    npx prisma db push
    echo "✅ Schema pushed to database"
else
    echo "⏭️  Skipping schema push"
fi
echo ""

# 3. Run the seed script
echo "🌱 Step 3: Seeding database..."
echo ""
echo "Choose seeding option:"
echo "1. Basic seed (quick setup - 5 users, 5 RFQs)"
echo "2. Comprehensive seed (full dataset - 50 suppliers, 20 buyers, 30 RFQs)"
echo "3. Skip seeding"
echo ""
read -p "Enter your choice (1/2/3): " seed_choice

case $seed_choice in
    1)
        echo "🌱 Running basic seed..."
        echo "Command: npm run db:seed:basic"
        npm run db:seed:basic
        ;;
    2)
        echo "🌱 Running comprehensive seed..."
        echo "Command: npm run db:seed:comprehensive"
        npm run db:seed:comprehensive
        ;;
    3)
        echo "⏭️  Skipping seeding"
        ;;
    *)
        echo "❌ Invalid choice. Skipping seeding."
        ;;
esac
echo ""

# 4. Verify data was inserted
echo "🔍 Step 4: Data verification..."
echo ""
read -p "Do you want to open Prisma Studio to verify data? (y/n): " open_studio
if [[ $open_studio == "y" || $open_studio == "Y" ]]; then
    echo "Opening Prisma Studio..."
    echo "Command: npx prisma studio"
    npx prisma studio &
    echo "✅ Prisma Studio opened in browser"
else
    echo "⏭️  Skipping Prisma Studio"
fi
echo ""

# 5. Run verification queries
echo "📊 Step 5: Running verification queries..."
echo ""
read -p "Do you want to run SQL verification queries? (y/n): " run_queries
if [[ $run_queries == "y" || $run_queries == "Y" ]]; then
    echo "Running verification queries..."
    echo ""
    
    # Check supplier count
    echo "Checking supplier count..."
    npx prisma db execute --file src/scripts/verify-seed.sql --schema prisma/schema.prisma | head -20
    
    echo ""
    echo "✅ Verification queries completed"
    echo "📋 Results summary:"
    echo "   - Check the SQL output above for counts"
    echo "   - Expected: 50 suppliers, 20 buyers, 30 RFQs, 50 quotes, 100 messages"
else
    echo "⏭️  Skipping verification queries"
fi
echo ""

# 6. Test accounts
echo "👥 Step 6: Test accounts ready!"
echo ""
echo "📝 Test Login Credentials:"
echo ""
echo "Buyer Accounts:"
echo "  • buyer1@bell24h.com / Test@123"
echo "  • buyer2@bell24h.com / Test@123"
echo "  • buyer3@bell24h.com / Test@123"
echo "  • ... up to buyer20@bell24h.com"
echo ""
echo "Supplier Accounts:"
echo "  • supplier1@bell24h.com / Test@123"
echo "  • supplier2@bell24h.com / Test@123"
echo "  • supplier3@bell24h.com / Test@123"
echo "  • ... up to supplier50@bell24h.com"
echo ""

# 7. Next steps
echo "🚀 Step 7: Next Steps"
echo ""
echo "✅ Database seeding completed!"
echo ""
echo "🔧 What to test next:"
echo "   1. Log in with test accounts"
echo "   2. Create new RFQs"
echo "   3. Submit quotes as suppliers"
echo "   4. Test chat messaging (Hindi-English mix)"
echo "   5. Test Razorpay payment flow"
echo "   6. Test n8n marketing workflows"
echo ""
echo "🔄 Reset Commands (if needed):"
echo "   • Reset database: npx prisma migrate reset"
echo "   • Clear all data: npx prisma db push --force-reset"
echo "   • Run seed again: npm run db:seed:comprehensive"
echo ""
echo "📚 Documentation:"
echo "   • Seeding guide: SEEDING_GUIDE.md"
echo "   • Verification queries: src/scripts/verify-seed.sql"
echo ""
echo "🎉 Happy testing!"

# Optional: Keep script running for user to see results
read -p "Press Enter to exit..."