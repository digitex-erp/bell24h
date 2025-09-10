# Environment Setup Guide for Developer

## 🚀 **QUICK START SETUP**

### **Prerequisites**
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)
- PostgreSQL database access

---

## 📋 **STEP-BY-STEP SETUP**

### **Step 1: Clone Repository**
```bash
git clone [repository-url]
cd bell24h
cd client
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Database Setup**

#### **Option A: Neon.tech (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create new project
4. Copy the DATABASE_URL

#### **Option B: Local PostgreSQL**
1. Install PostgreSQL locally
2. Create database: `bell24h`
3. Note connection details

### **Step 4: Environment Variables**

Create `.env.local` file in `client/` directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Email (for password reset)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

### **Step 5: Database Migration**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed database
npm run db:seed
```

### **Step 6: Start Development Server**
```bash
npm run dev
```

---

## 🔧 **ENVIRONMENT VARIABLES EXPLAINED**

### **Required Variables:**

#### **DATABASE_URL**
- **Purpose:** PostgreSQL connection string
- **Format:** `postgresql://username:password@host:port/database`
- **Example:** `postgresql://user:pass@localhost:5432/bell24h`

#### **NEXTAUTH_SECRET**
- **Purpose:** JWT signing secret
- **Generate:** `openssl rand -base64 32`
- **Example:** `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

#### **NEXTAUTH_URL**
- **Purpose:** Application base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`

### **Optional Variables:**

#### **Email Configuration (for password reset)**
```bash
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

#### **Google OAuth (if implementing social login)**
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## 🗄️ **DATABASE CONFIGURATION**

### **Prisma Schema Setup**

The `prisma/schema.prisma` should include NextAuth tables:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Database Connection Error**
```
Error: Can't reach database server
```
**Solution:**
- Check DATABASE_URL format
- Verify database is running
- Check network connectivity
- Verify credentials

#### **2. Prisma Client Error**
```
Error: PrismaClient is unable to run
```
**Solution:**
```bash
npx prisma generate
npm install @prisma/client
```

#### **3. NextAuth Configuration Error**
```
Error: NEXTAUTH_SECRET is not defined
```
**Solution:**
- Add NEXTAUTH_SECRET to .env.local
- Restart development server

#### **4. Port Already in Use**
```
Error: Port 3000 is already in use
```
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

#### **5. Module Not Found**
```
Error: Cannot find module '@prisma/client'
```
**Solution:**
```bash
npm install
npx prisma generate
```

---

## 🔍 **VERIFICATION STEPS**

### **1. Database Connection Test**
```bash
# Test database connection
npx prisma db pull
```

### **2. NextAuth Configuration Test**
```bash
# Check if NextAuth is configured
npm run dev
# Visit: http://localhost:3000/api/auth/providers
```

### **3. Application Test**
```bash
# Start application
npm run dev
# Visit: http://localhost:3000
# Check for errors in console
```

---

## 📁 **FILE STRUCTURE**

```
client/
├── .env.local                 # Environment variables
├── .env.example              # Example environment file
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Database seed file
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── lib/
│       └── auth.ts          # NextAuth configuration
└── package.json
```

---

## 🛠️ **DEVELOPMENT COMMANDS**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npx prisma generate          # Generate Prisma client
npx prisma db push          # Push schema to database
npx prisma db pull          # Pull schema from database
npx prisma studio           # Open database GUI

# Testing
npm test                    # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

---

## 🔐 **SECURITY NOTES**

### **Environment Variables:**
- Never commit `.env.local` to git
- Use strong, unique secrets
- Rotate secrets regularly
- Use different secrets for dev/staging/prod

### **Database:**
- Use strong passwords
- Enable SSL connections
- Restrict database access
- Regular backups

### **NextAuth:**
- Use strong NEXTAUTH_SECRET
- Configure proper CORS
- Set secure cookie options
- Implement rate limiting

---

## 📞 **SUPPORT**

### **If You Get Stuck:**
1. Check this guide first
2. Check console errors
3. Verify environment variables
4. Test database connection
5. Contact for help

### **Useful Resources:**
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Ready to start coding? Let's fix this authentication system! 🚀**
