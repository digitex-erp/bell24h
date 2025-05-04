# Bell24h.com Deployment File Structure

This document outlines the key files and directories required for deploying Bell24h.com to various platforms including Vercel, Render, AWS, and Snky.

## Overall Project Completion: 78%

## Important Files and Directories

### Configuration Files
- `/.env` - Environment variables configuration (IMPORTANT: do not include in version control)
- `/package.json` - Main package configuration
- `/docker-compose.yml` - Docker configuration for containerized deployment
- `/Dockerfile` - Docker image configuration
- `/tsconfig.json` - TypeScript configuration
- `/drizzle.config.ts` - Database ORM configuration

### Database
- `/shared/schema.ts` - Core database schema definitions with types
- `/prisma/schema.prisma` - Prisma schema definition (if using Prisma)
- `/server/db.ts` - Database connection setup
- `/server/storage.ts` - Storage interface implementation
- `/scripts/seed-market-trends.ts` - Database seeding script for market trends

### Server-Side Files
- `/server/index.ts` - Main server entry point
- `/server/routes.ts` - API routes definition
- `/server/auth.ts` - Authentication setup
- `/server/middleware/` - Middleware components

#### Services
- `/server/services/analytics.ts` - Analytics service implementation
- `/server/services/escrow-wallet.ts` - Escrow wallet service
- `/server/services/model-explainer.ts` - AI model explainers with SHAP/LIME
- `/server/services/gst-validation.ts` - GST validation service
- `/server/services/invoice.ts` - Invoice management service
- `/server/services/kredx.ts` - KredX integration service
- `/server/services/blockchain.ts` - Blockchain integration service

#### Libraries
- `/server/lib/razorpayX.ts` - RazorpayX integration
- `/server/lib/alphaVantage.ts` - Stock market data integration
- `/server/lib/cloudinary.ts` - Media storage integration
- `/server/lib/s3.ts` - AWS S3 integration
- `/server/lib/ai/market_forecasting.ts` - AI market forecasting
- `/server/lib/ai/explainable/` - Explainable AI components

#### APIs & Routes
- `/server/routes/analytics_routes.ts` - Analytics API routes
- `/server/routes/ai_routes.ts` - AI-specific API routes
- `/server/routes/user_routes.ts` - User management routes
- `/server/routes/rfq_routes.ts` - RFQ management routes
- `/server/routes/bid_routes.ts` - Bid management routes
- `/server/routes/invoice_routes.ts` - Invoice management routes
- `/server/routes/escrow_routes.ts` - Escrow system routes
- `/server/routes/blockchain_routes.ts` - Blockchain operations routes

### Client-Side Files
- `/client/src/App.tsx` - Main React application component
- `/client/src/index.tsx` - React application entry point
- `/client/src/index.css` - Global styles

#### Components
- `/client/src/components/layout/` - Layout components (header, sidebar, etc.)
- `/client/src/components/dashboard/AnalyticsDashboard.tsx` - Analytics dashboard
- `/client/src/components/blockchain/` - Blockchain integration components
- `/client/src/components/escrow/` - Escrow system components
- `/client/src/components/ui/` - UI component library

#### Pages
- `/client/src/pages/` - Top-level page components
- `/client/src/pages/Analytics.tsx` - Analytics page
- `/client/src/pages/RFQ.tsx` - RFQ management page
- `/client/src/pages/Bids.tsx` - Bid management page
- `/client/src/pages/Products.tsx` - Product catalog page
- `/client/src/pages/Invoice.tsx` - Invoice management page
- `/client/src/pages/Escrow.tsx` - Escrow wallet page

#### Libraries & Utilities
- `/client/src/lib/charts.ts` - Chart creation utilities
- `/client/src/lib/queryClient.ts` - API client setup
- `/client/src/hooks/` - Custom React hooks

### AI Model Files
- `/server/lib/ai/explainable/supplier_risk_explainer.py` - Supplier risk assessment model with explanations
- `/server/lib/ai/explainable/rfq_matching_explainer.py` - RFQ matching explainer with LIME/SHAP
- `/server/lib/ai/explainable/price_predictor.py` - Price prediction model with explanations

### WebSockets
- `/server/websockets.ts` - WebSocket server setup
- `/client/src/lib/websocket.ts` - WebSocket client setup

### Deployment-Specific Files
- `/vercel.json` - Vercel-specific configuration
- `/render.yaml` - Render-specific configuration
- `/aws/` - AWS-specific configurations (CloudFormation, etc.)
- `/public/` - Static public assets

## Deployment Instructions

### Environment Variables Required for All Platforms
```
DATABASE_URL=postgresql://...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
OPENAI_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_S3_BUCKET=...
JWT_SECRET=...
POLYGON_RPC_URL=...
POLYGON_PRIVATE_KEY=...
```

### Platform-Specific Deployment Notes

#### Vercel
- Use the Vercel CLI or GitHub integration for deployment
- Add all environment variables through the Vercel dashboard
- Set build command: `npm run build`
- Set output directory: `dist`

#### Render
- Connect your GitHub repository
- Use the `render.yaml` configuration
- Set environment variables in the Render dashboard
- Configure the database connection separately

#### AWS
- Use Elastic Beanstalk or ECS for containerized deployment
- Configure RDS for the PostgreSQL database
- Use S3 for static file storage
- Configure environment variables through AWS Parameter Store or Secrets Manager

#### Snky
- Follow Snky-specific deployment documentation
- Add environment variables through the Snky dashboard
- Configure webhook integrations as needed

## Deployment Checklist
1. Ensure all environment variables are properly set
2. Run database migrations before deployment
3. Test all critical API endpoints
4. Verify WebSocket connectivity
5. Check blockchain integration with test transactions
6. Verify RazorpayX integration with test account
7. Ensure CORS is properly configured
8. Set up proper logging and monitoring
9. Configure SSL/TLS certificates
10. Set up CI/CD pipeline for automated deployments

## Contact for Deployment Support
For deployment assistance, contact the development team at support@bell24h.com