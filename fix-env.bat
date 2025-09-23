@echo off
cd C:\Users\Sanika\Projects\bell24h\client
echo OPENAI_API_KEY=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 > .env.local
echo NEXTAUTH_SECRET=bell24h_secret_key_2025_autonomous_system >> .env.local
echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
echo DATABASE_URL=postgresql://bell24h:Bell24h@2025@localhost:5432/bell24h >> .env.local
echo RAZORPAY_KEY_ID=rzp_live_JzjA268916kOdR >> .env.local
echo RAZORPAY_KEY_SECRET=zgKuNGLemP0X53HXuM4l >> .env.local
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1 >> .env.local
echo MSG91_SENDER_ID=BELL24H >> .env.local
echo NODE_ENV=development >> .env.local
echo Environment file created successfully!
pause
