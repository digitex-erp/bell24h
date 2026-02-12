# Bell24h Database Seed Script - Windows PowerShell Instructions
# Production-ready database seeder for Indian B2B marketplace

<#
.SYNOPSIS
    Comprehensive database seeding script for Bell24h B2B marketplace
.DESCRIPTION
    This script seeds your database with realistic Indian B2B data including:
    - 50 supplier accounts with authentic Indian company data
    - 20 buyer accounts with major Indian corporations
    - 30 RFQs with realistic product requirements
    - 50 quotes from suppliers
    - 100 chat messages (Hindi-English mix)
    - 25 payment records with Razorpay integration
    - 50 product categories

    All data is idempotent - can be run multiple times safely.
#>

# =============================================================================
# CONFIGURATION
# =============================================================================

# Set environment variables for local development
$env:DATABASE_URL = "file:./dev.db"
$env:NODE_ENV = "development"

# Colors for better output
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$RESET = "`e[0m"

# =============================================================================
# FUNCTIONS
# =============================================================================

function Write-Info {
    param([string]$Message)
    Write-Host "${BLUE}[INFO]${RESET} $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "${GREEN}[SUCCESS]${RESET} $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "${RED}[ERROR]${RESET} $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${YELLOW}[WARNING]${RESET} $Message" -ForegroundColor Yellow
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js found: $nodeVersion"
    } catch {
        Write-Error "Node.js not found. Please install Node.js first."
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Success "npm found: $npmVersion"
    } catch {
        Write-Error "npm not found. Please install npm first."
        exit 1
    }
    
    # Check if package.json exists
    if (!(Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from your project root directory."
        exit 1
    }
    
    Write-Success "All prerequisites met!"
}

function Install-Dependencies {
    Write-Info "Installing dependencies..."
    try {
        npm install
        Write-Success "Dependencies installed successfully!"
    } catch {
        Write-Error "Failed to install dependencies: $($_.Exception.Message)"
        exit 1
    }
}

function Generate-PrismaClient {
    Write-Info "Generating Prisma client..."
    try {
        npx prisma generate
        Write-Success "Prisma client generated successfully!"
    } catch {
        Write-Error "Failed to generate Prisma client: $($_.Exception.Message)"
        exit 1
    }
}

function Reset-Database {
    Write-Warning "This will DELETE all existing data in your database!"
    $confirm = Read-Host "Are you sure you want to reset the database? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Info "Resetting database..."
        try {
            npx prisma migrate reset --force
            Write-Success "Database reset successfully!"
        } catch {
            Write-Error "Failed to reset database: $($_.Exception.Message)"
            exit 1
        }
    } else {
        Write-Info "Database reset cancelled."
    }
}

function Push-Schema {
    Write-Info "Pushing Prisma schema to database..."
    try {
        npx prisma db push
        Write-Success "Schema pushed successfully!"
    } catch {
        Write-Error "Failed to push schema: $($_.Exception.Message)"
        exit 1
    }
}

function Seed-Database {
    Write-Info "Running database seed script..."
    try {
        npx tsx src/scripts/seed-database.ts
        Write-Success "Database seeded successfully!"
    } catch {
        Write-Error "Failed to seed database: $($_.Exception.Message)"
        exit 1
    }
}

function Verify-Seed {
    Write-Info "Verifying seed data..."
    
    # Create a verification script
    $verifyScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySeed() {
    console.log('🔍 Verifying seed data...');
    
    // Check counts with specific SQL queries as requested
    console.log('📊 Running verification queries...');
    
    // Check supplier count
    const suppliers = await prisma.user.count({ where: { type: 'SUPPLIER' } });
    console.log(`✅ Suppliers: ${suppliers} (expected: 50)`);
    if (suppliers !== 50) console.log('⚠️  WARNING: Supplier count mismatch!');
    
    // Check buyer count  
    const buyers = await prisma.user.count({ where: { type: 'BUYER' } });
    console.log(`✅ Buyers: ${buyers} (expected: 20)`);
    if (buyers !== 20) console.log('⚠️  WARNING: Buyer count mismatch!');
    
    // Check RFQ count
    const rfqs = await prisma.rfq.count();
    console.log(`✅ RFQs: ${rfqs} (expected: 30)`);
    if (rfqs !== 30) console.log('⚠️  WARNING: RFQ count mismatch!');
    
    // Check quote count
    const quotes = await prisma.quote.count();
    console.log(`✅ Quotes: ${quotes} (expected: 50)`);
    if (quotes !== 50) console.log('⚠️  WARNING: Quote count mismatch!');
    
    // Check message count
    const messages = await prisma.message.count();
    console.log(`✅ Messages: ${messages} (expected: 100)`);
    if (messages !== 100) console.log('⚠️  WARNING: Message count mismatch!');
    
    // Check payment count
    const payments = await prisma.payment.count();
    console.log(`✅ Payments: ${payments} (expected: 25)`);
    if (payments !== 25) console.log('⚠️  WARNING: Payment count mismatch!');
    
    // Check categories count
    const categories = await prisma.category.count();
    console.log(`✅ Categories: ${categories} (expected: 50)`);
    if (categories !== 50) console.log('⚠️  WARNING: Category count mismatch!');
    
    console.log('\\n📋 Data Summary:');
    console.log(`   Suppliers: ${suppliers}/50`);
    console.log(`   Buyers: ${buyers}/20`);
    console.log(`   RFQs: ${rfqs}/30`);
    console.log(`   Quotes: ${quotes}/50`);
    console.log(`   Messages: ${messages}/100`);
    console.log(`   Payments: ${payments}/25`);
    console.log(`   Categories: ${categories}/50`);
    
    // Sample data display as requested
    console.log('\\n🎯 Sample Data Check:');
    
    // Sample suppliers (first 5 as requested)
    const sampleSuppliers = await prisma.user.findMany({ 
        where: { type: 'SUPPLIER' },
        select: { email: true, companyName: true, city: true, gstNumber: true, phone: true },
        take: 5
    });
    
    console.log('\\n📋 First 5 Suppliers:');
    sampleSuppliers.forEach((supplier, index) => {
        console.log(`   ${index + 1}. ${supplier.companyName} (${supplier.city})`);
        console.log(`      Email: ${supplier.email}`);
        console.log(`      Phone: ${supplier.phone}`);
        console.log(`      GST: ${supplier.gstNumber}`);
    });
    
    // Sample RFQs (first 5 as requested)
    const sampleRFQs = await prisma.rfq.findMany({
        select: { 
            title: true, 
            quantity: true, 
            unit: true, 
            targetPrice: true, 
            category: { select: { name: true } },
            buyer: { select: { companyName: true, city: true } }
        },
        take: 5
    });
    
    console.log('\\n📋 First 5 RFQs:');
    sampleRFQs.forEach((rfq, index) => {
        console.log(`   ${index + 1}. ${rfq.title}`);
        console.log(`      Quantity: ${rfq.quantity} ${rfq.unit}`);
        console.log(`      Target Price: ₹${rfq.targetPrice}`);
        console.log(`      Category: ${rfq.category.name}`);
        console.log(`      Buyer: ${rfq.buyer.companyName} (${rfq.buyer.city})`);
    });
    
    // Sample quotes (first 5)
    const sampleQuotes = await prisma.quote.findMany({
        select: {
            price: true,
            deliveryTime: true,
            supplier: { select: { companyName: true } },
            rfq: { select: { title: true } }
        },
        take: 5
    });
    
    console.log('\\n📋 First 5 Quotes:');
    sampleQuotes.forEach((quote, index) => {
        console.log(`   ${index + 1}. ₹${quote.price} for "${quote.rfq.title}"`);
        console.log(`      Supplier: ${quote.supplier.companyName}`);
        console.log(`      Delivery: ${quote.deliveryTime} days`);
    });
    
    // Test accounts
    console.log('\\n🧪 Test Account Credentials:');
    console.log('   Buyers: buyer1@bell24h.com to buyer20@bell24h.com');
    console.log('   Suppliers: supplier1@bell24h.com to supplier50@bell24h.com');
    console.log('   Password: Test@123');
    
    // Manual SQL queries for verification (as requested)
    console.log('\\n📝 Manual SQL Verification Queries:');
    console.log('   -- Check supplier count');
    console.log('   SELECT COUNT(*) FROM users WHERE type = \'SUPPLIER\';');
    console.log('   -- Expected: 50');
    console.log('');
    console.log('   -- Check buyer count');  
    console.log('   SELECT COUNT(*) FROM users WHERE type = \'BUYER\';');
    console.log('   -- Expected: 20');
    console.log('');
    console.log('   -- Check RFQ count');
    console.log('   SELECT COUNT(*) FROM rfqs;');
    console.log('   -- Expected: 30');
    console.log('');
    console.log('   -- Check quote count');
    console.log('   SELECT COUNT(*) FROM quotes;');
    console.log('   -- Expected: 50');
    console.log('');
    console.log('   -- Check message count');
    console.log('   SELECT COUNT(*) FROM messages;');
    console.log('   -- Expected: 100');
    console.log('');
    console.log('   -- Check payment count');
    console.log('   SELECT COUNT(*) FROM payments;');
    console.log('   -- Expected: 25');
    console.log('');
    console.log('   -- Check categories count');
    console.log('   SELECT COUNT(*) FROM categories;');
    console.log('   -- Expected: 50');
    console.log('');
    console.log('   -- Sample data check');
    console.log('   SELECT * FROM users WHERE type = \'SUPPLIER\' LIMIT 5;');
    console.log('   SELECT * FROM rfqs LIMIT 5;');
    console.log('   SELECT * FROM quotes LIMIT 5;');
    
    await prisma.disconnect();
}

verifySeed().catch(console.error);
"@
    
    # Save and run verification script
    $verifyScript | Out-File -FilePath "verify-seed.js" -Encoding UTF8
    
    try {
        node verify-seed.js
        Remove-Item "verify-seed.js" -Force
        Write-Success "Verification completed!"
    } catch {
        Write-Error "Verification failed: $($_.Exception.Message)"
        if (Test-Path "verify-seed.js") {
            Remove-Item "verify-seed.js" -Force
        }
    }
}

function Show-QuickCommands {
    Write-Info "Quick Commands for Development:"
    Write-Host @"

🚀 RUN SEED SCRIPT:
   $env:DATABASE_URL="file:./dev.db"; npx tsx src/scripts/seed-database.ts

🌐 OPEN PRISMA STUDIO:
   $env:DATABASE_URL="file:./dev.db"; npx prisma studio

🧪 VERIFY DATA:
   $env:DATABASE_URL="file:./dev.db"; node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.count({where:{type:'SUPPLIER'}}).then(c => console.log('Suppliers:', c)); prisma.user.count({where:{type:'BUYER'}}).then(c => console.log('Buyers:', c)); prisma.rfq.count().then(c => console.log('RFQs:', c)); prisma.quote.count().then(c => console.log('Quotes:', c)); prisma.message.count().then(c => console.log('Messages:', c)); prisma.payment.count().then(c => console.log('Payments:', c)); prisma.category.count().then(c => console.log('Categories:', c)); setTimeout(() => prisma.\$disconnect(), 2000);"

🔄 RESET DATABASE:
   $env:DATABASE_URL="file:./dev.db"; npx prisma migrate reset --force

📝 MANUAL SQL QUERIES:
   # Check supplier count
   SELECT COUNT(*) FROM users WHERE type = 'SUPPLIER';
   
   # Check buyer count  
   SELECT COUNT(*) FROM users WHERE type = 'BUYER';
   
   # Check RFQ count
   SELECT COUNT(*) FROM rfqs;
   
   # Check quote count
   SELECT COUNT(*) FROM quotes;
   
   # Check message count
   SELECT COUNT(*) FROM messages;
   
   # Check payment count
   SELECT COUNT(*) FROM payments;
   
   # Check categories count
   SELECT COUNT(*) FROM categories;
   
   # Sample data check
   SELECT * FROM users WHERE type = 'SUPPLIER' LIMIT 5;
   SELECT * FROM rfqs LIMIT 5;
   SELECT * FROM quotes LIMIT 5;
   
   # Check RFQ count
   SELECT COUNT(*) FROM rfqs;
   
   # Check quote count
   SELECT COUNT(*) FROM quotes;
   
   # Check message count
   SELECT COUNT(*) FROM messages;
   
   # Check payment count
   SELECT COUNT(*) FROM payments;
   
   # Check categories count
   SELECT COUNT(*) FROM categories;
   
   # Sample data check
   SELECT * FROM users WHERE type = 'SUPPLIER' LIMIT 5;
   SELECT * FROM rfqs LIMIT 5;
   SELECT * FROM quotes LIMIT 5;

"@
}

# =============================================================================
# MAIN MENU
# =============================================================================

function Show-MainMenu {
    Clear-Host
    Write-Host @"

╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 BELL24H DATABASE SEED MANAGER                        ║
║                    Indian B2B Marketplace Seeder                           ║
╚══════════════════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

    Write-Host "Available Options:"
    Write-Host "1. Full Setup (Install deps + Generate Prisma + Push Schema + Seed + Verify)"
    Write-Host "2. Quick Seed (Just run seed script)"
    Write-Host "3. Reset Database (Clear all data)"
    Write-Host "4. Verify Seed Data"
    Write-Host "5. Show Quick Commands"
    Write-Host "6. Exit"
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-6)"
    
    switch ($choice) {
        "1" {
            Test-Prerequisites
            Install-Dependencies
            Generate-PrismaClient
            Push-Schema
            Seed-Database
            Verify-Seed
            Write-Host ""
            Write-Success "🎉 Full setup completed successfully!"
            Write-Host ""
            Read-Host "Press Enter to continue..."
            Show-MainMenu
        }
        "2" {
            Seed-Database
            Write-Host ""
            Read-Host "Press Enter to continue..."
            Show-MainMenu
        }
        "3" {
            Reset-Database
            Write-Host ""
            Read-Host "Press Enter to continue..."
            Show-MainMenu
        }
        "4" {
            Verify-Seed
            Write-Host ""
            Read-Host "Press Enter to continue..."
            Show-MainMenu
        }
        "5" {
            Show-QuickCommands
            Write-Host ""
            Read-Host "Press Enter to continue..."
            Show-MainMenu
        }
        "6" {
            Write-Host "Goodbye! 👋"
            exit 0
        }
        default {
            Write-Error "Invalid choice. Please enter 1-6."
            Start-Sleep -Seconds 2
            Show-MainMenu
        }
    }
}

# =============================================================================
# ENTRY POINT
# =============================================================================

# Check if running as administrator (optional warning)
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Running without administrator privileges. This should work fine for most operations."
}

# Show main menu
Show-MainMenu