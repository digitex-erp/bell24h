@echo off
echo Setting up Bell24h Environment Variables...

echo # Bell24h Local Development Environment Variables > .env.local
echo # Generated from template >> .env.local
echo. >> .env.local
echo # Database Configuration >> .env.local
echo DATABASE_URL="file:./prisma/dev.db" >> .env.local
echo. >> .env.local
echo # NextAuth Configuration >> .env.local
echo NEXTAUTH_URL="http://localhost:3000" >> .env.local
echo NEXTAUTH_SECRET="bell24h-nextauth-secret-key-2024-development-32-chars" >> .env.local
echo. >> .env.local
echo # JWT Configuration >> .env.local
echo JWT_SECRET="bell24h-jwt-secret-key-2024-development-32-chars" >> .env.local
echo. >> .env.local
echo # AI Integration Keys >> .env.local
echo OPENAI_API_KEY="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" >> .env.local
echo NANO_BANANA_API_KEY="AIzaSyC-XH19RV9PgHAgTmduVcEd2IeMz8iwvac" >> .env.local
echo. >> .env.local
echo # Payment Gateway (for development) >> .env.local
echo RAZORPAY_KEY_ID="rzp_test_your-razorpay-key-id" >> .env.local
echo RAZORPAY_KEY_SECRET="your-razorpay-secret-key" >> .env.local
echo STRIPE_PUBLIC_KEY="pk_test_your-stripe-public-key" >> .env.local
echo STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key" >> .env.local
echo. >> .env.local
echo # Development Flags >> .env.local
echo NODE_ENV="development" >> .env.local
echo NEXT_PUBLIC_DEBUG="true" >> .env.local
echo NEXT_PUBLIC_ENABLE_AI_FEATURES="true" >> .env.local
echo NEXT_PUBLIC_ENABLE_VOICE_RFQ="true" >> .env.local

echo Environment file created successfully!
echo.
echo Testing AI integrations...
node test-ai-integration.js

pause
