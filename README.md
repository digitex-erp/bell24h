# Bell24h - India's Fastest B2B Match-Making Engine

A modern, AI-powered B2B marketplace built with Next.js 15, featuring secure authentication, RFQ management, and escrow-protected transactions.

## 🚀 Features

### Core Platform
- **AI-Powered Matching**: 200+ data signals for intelligent supplier matching
- **24-Hour RFQ Closure**: Get 3 verified quotes within 24 hours
- **Escrow-Secured Payments**: Funds held until satisfaction confirmed
- **GST & PAN Verification**: All suppliers pre-verified
- **Trust Scoring**: AI-generated trust scores on every profile

### Authentication & Security
- **Dual Login**: Email/password + Phone OTP authentication
- **NextAuth.js Integration**: Secure session management
- **JWT Tokens**: Stateless authentication
- **Security Headers**: Comprehensive security middleware
- **Route Protection**: Protected dashboard and RFQ pages

### RFQ Management
- **Create RFQs**: Detailed request forms with specifications
- **Category Management**: Steel, Textiles, Electronics, and more
- **Quote Tracking**: Monitor and compare supplier quotes
- **Status Management**: Active, completed, and cancelled RFQs

### UI/UX
- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Mobile-first design approach
- **Bell24h Branding**: Consistent visual identity
- **Toast Notifications**: Real-time user feedback
- **Loading States**: Smooth user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM (ready for PostgreSQL/MySQL)
- **UI Components**: Radix UI primitives
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bell24h-complete
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add the following variables:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   DATABASE_URL=your-database-url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Set environment variables**
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all required environment variables

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
bell24h-complete/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   ├── otp/
│   │   │   └── register/
│   │   └── rfq/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── rfq/
│   │   └── new/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── auth.ts
├── middleware.ts
├── vercel.json
└── package.json
```

## 🔧 Configuration

### Authentication
- Configure NextAuth providers in `lib/auth.ts`
- Add OAuth providers as needed
- Set up database sessions for production

### Database
- Prisma schema ready for User, RFQ, Session models
- Configure database connection in `DATABASE_URL`
- Run migrations: `npx prisma migrate dev`

### Styling
- Tailwind configuration in `tailwind.config.js`
- Custom components in `app/globals.css`
- Brand colors and gradients defined

## 🎯 Key Features Implementation

### 1. Homepage
- Hero section with Bell24h branding
- Trust badges and social proof
- Category showcase
- Clear CTAs for RFQ creation

### 2. Authentication
- Dual login system (email + OTP)
- Secure session management
- Protected routes
- User registration flow

### 3. Dashboard
- User statistics and metrics
- Quick actions
- Recent activity feed
- RFQ management

### 4. RFQ System
- Create detailed RFQs
- Category and specification management
- Quote tracking and comparison
- Status management

## 🔒 Security Features

- **HTTPS Enforcement**: Automatic SSL/TLS
- **Security Headers**: XSS, CSRF, and clickjacking protection
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **Rate Limiting**: API endpoint protection

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Responsive navigation
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🚀 Performance

- **Next.js 15**: Latest framework features
- **App Router**: Optimized routing and loading
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic code splitting
- **Static Generation**: Pre-rendered pages where possible

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎉 Acknowledgments

- Built with Next.js and Tailwind CSS
- UI components from Radix UI
- Authentication powered by NextAuth.js
- Deployed on Vercel

---

**Bell24h** - India's Fastest B2B Match-Making Engine for MSMEs 🇮🇳