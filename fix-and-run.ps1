# Bell24x Fix and Run Script
Write-Host "🔧 Fixing Bell24x Issues..." -ForegroundColor Yellow

# Install all dependencies
Write-Host "📦 Installing all dependencies..." -ForegroundColor Cyan
npm install

# Install specific missing packages
Write-Host "🔧 Installing missing packages..." -ForegroundColor Cyan
npm install react-hot-toast next-auth @prisma/client prisma bcryptjs jsonwebtoken zod @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-separator class-variance-authority clsx tailwind-merge lucide-react

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "🌐 Your Bell24x platform will be available at: http://localhost:3000" -ForegroundColor White

npm run dev
