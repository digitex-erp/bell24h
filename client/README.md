# BELL24H - India's Premier B2B Marketplace

A unified B2B marketplace platform that connects buyers and sellers across India with AI-powered matching, secure transactions, and comprehensive business tools.

## 🚀 Features

### Core Marketplace

- **Dual Mode Support**: Seamlessly switch between buying and selling modes
- **AI-Powered Matching**: Intelligent partner recommendations based on business needs
- **Verified Business Partners**: ECGC-approved suppliers with comprehensive verification
- **Real-time Communication**: Integrated messaging and notification system

### Business Tools

- **Unified Dashboard**: Comprehensive business hub for both buyers and sellers
- **Analytics & Insights**: Performance metrics and market intelligence
- **Order Management**: Complete order lifecycle tracking
- **Payment Processing**: Secure escrow and payment solutions

### Security & Compliance

- **ECGC Protection**: Government-backed trade protection
- **Identity Verification**: Multi-level business verification
- **Secure Transactions**: Blockchain-backed escrow system
- **Data Protection**: GDPR-compliant data handling

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel, Docker
- **Monitoring**: Sentry, Google Analytics
- **Payments**: Stripe, Razorpay
- **AI/ML**: OpenAI API, Custom ML models

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Redis (for caching)
- SMTP server (for emails)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/bell24h.git
cd bell24h/client
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

```bash
# Copy environment template
cp env.example .env.local

# Edit with your configuration
nano .env.local
```

### 4. Database Setup

```bash
# Install Prisma CLI
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── marketplace/       # Marketplace pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   ├── suppliers/         # Supplier pages
│   │   ├── sitemap.ts         # SEO sitemap
│   │   └── robots.ts          # SEO robots.txt
│   ├── components/            # Reusable components
│   │   ├── SEO.tsx           # SEO component
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   └── ...               # Other components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript types
│   └── utils/                 # Helper functions
├── public/                    # Static assets
├── prisma/                    # Database schema
├── tests/                     # Test files
└── docs/                      # Documentation
```

## 🔧 Configuration

### Environment Variables

Key environment variables (see `env.example` for complete list):

```bash
# Application
NEXT_PUBLIC_APP_NAME=BELL24H
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bell24h"

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Payments
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Database Schema

The application uses Prisma with the following main models:

- **User**: Authentication and profile data
- **Business**: Company information and verification
- **Product**: Product catalog and specifications
- **Order**: Transaction and order management
- **Message**: Communication system
- **Review**: Rating and feedback system

## 🚀 Deployment

### Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t bell24h .

# Run container
docker run -p 3000:3000 bell24h
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Setup for Production

1. **Database**: Set up PostgreSQL on your preferred provider
2. **Redis**: Configure Redis for session storage and caching
3. **Email**: Configure SMTP server for notifications
4. **CDN**: Set up CDN for static assets
5. **Monitoring**: Configure Sentry for error tracking

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API endpoint and database tests
- **E2E Tests**: Full user journey tests with Playwright

## 📊 Performance Optimization

### Built-in Optimizations

- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Static generation and ISR
- **CDN**: Asset delivery optimization

### Monitoring

- **Core Web Vitals**: Real-time performance monitoring
- **Error Tracking**: Sentry integration
- **Analytics**: Google Analytics 4
- **Uptime**: Health check endpoints

## 🔒 Security

### Security Features

- **HTTPS Only**: Enforced in production
- **CSP Headers**: Content Security Policy
- **XSS Protection**: Built-in React protections
- **CSRF Protection**: NextAuth.js CSRF tokens
- **Rate Limiting**: API rate limiting
- **Input Validation**: Comprehensive form validation

### Best Practices

- Environment variables for sensitive data
- Regular dependency updates
- Security headers configuration
- Input sanitization
- SQL injection prevention

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Standard commit messages

## 📚 Documentation

### Additional Resources

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guide](./docs/SECURITY.md)
- [Performance Guide](./docs/PERFORMANCE.md)

### Support

- **Issues**: [GitHub Issues](https://github.com/your-org/bell24h/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/bell24h/discussions)
- **Email**: support@bell24h.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Vercel**: For hosting and deployment
- **Tailwind CSS**: For the utility-first CSS framework
- **Prisma**: For the excellent ORM
- **OpenAI**: For AI capabilities

---

**BELL24H** - Connecting India's Business Community

_Built with ❤️ for the Indian business ecosystem_
