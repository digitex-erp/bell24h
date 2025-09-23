@echo off
echo 🌐 FIXING DOMAIN DNS CONFIGURATION
echo ===================================
echo.

echo 📋 Bell24h Domain Configuration Guide
echo =====================================
echo.

echo 🎯 DOMAIN: bell24h.com
echo 🎯 SUBDOMAIN: www.bell24h.com
echo 🎯 N8N SUBDOMAIN: n8n.bell24h.com
echo.

echo 📊 Current DNS Status Check...
echo.

echo 🔍 Step 1: Checking Vercel deployment status...
echo Please check your Vercel dashboard for:
echo - Domain configuration status
echo - SSL certificate status
echo - DNS propagation status
echo.

echo 📋 Step 2: Required DNS Records
echo ==============================
echo.
echo For bell24h.com (Root Domain):
echo Type: A
echo Name: @
echo Value: 76.76.19.61
echo TTL: 3600
echo.
echo For www.bell24h.com (WWW Subdomain):
echo Type: CNAME
echo Name: www
echo Value: cname.vercel-dns.com
echo TTL: 3600
echo.
echo For n8n.bell24h.com (n8n Subdomain):
echo Type: CNAME
echo Name: n8n
echo Value: cname.vercel-dns.com
echo TTL: 3600
echo.

echo 🔧 Step 3: Vercel Configuration Updates
echo ======================================
echo.

echo Creating updated vercel.json...
echo { > vercel-updated.json
echo   "version": 2, >> vercel-updated.json
echo   "framework": "nextjs", >> vercel-updated.json
echo   "installCommand": "npm install && npx prisma generate", >> vercel-updated.json
echo   "functions": { >> vercel-updated.json
echo     "app/api/**/*.ts": { >> vercel-updated.json
echo       "runtime": "nodejs18.x" >> vercel-updated.json
echo     } >> vercel-updated.json
echo   }, >> vercel-updated.json
echo   "headers": [ >> vercel-updated.json
echo     { >> vercel-updated.json
echo       "source": "/(.*)", >> vercel-updated.json
echo       "headers": [ >> vercel-updated.json
echo         { >> vercel-updated.json
echo           "key": "X-Content-Type-Options", >> vercel-updated.json
echo           "value": "nosniff" >> vercel-updated.json
echo         }, >> vercel-updated.json
echo         { >> vercel-updated.json
echo           "key": "X-Frame-Options", >> vercel-updated.json
echo           "value": "DENY" >> vercel-updated.json
echo         }, >> vercel-updated.json
echo         { >> vercel-updated.json
echo           "key": "X-XSS-Protection", >> vercel-updated.json
echo           "value": "1; mode=block" >> vercel-updated.json
echo         } >> vercel-updated.json
echo       ] >> vercel-updated.json
echo     } >> vercel-updated.json
echo   ], >> vercel-updated.json
echo   "redirects": [ >> vercel-updated.json
echo     { >> vercel-updated.json
echo       "source": "/(.*)", >> vercel-updated.json
echo       "destination": "https://www.bell24h.com/$1", >> vercel-updated.json
echo       "permanent": true, >> vercel-updated.json
echo       "has": [ >> vercel-updated.json
echo         { >> vercel-updated.json
echo           "type": "host", >> vercel-updated.json
echo           "value": "bell24h.com" >> vercel-updated.json
echo         } >> vercel-updated.json
echo       ] >> vercel-updated.json
echo     } >> vercel-updated.json
echo   ] >> vercel-updated.json
echo } >> vercel-updated.json

echo ✅ Updated vercel.json created

echo.
echo 📋 Step 4: Environment Variables for Production
echo ===============================================
echo.

echo Creating production environment template...
echo # Bell24h Production Environment Variables > .env.production.template
echo # Copy this to Vercel environment variables >> .env.production.template
echo. >> .env.production.template
echo # Database Configuration >> .env.production.template
echo DATABASE_URL="postgresql://username:password@host:5432/bell24h_prod" >> .env.production.template
echo. >> .env.production.template
echo # NextAuth Configuration >> .env.production.template
echo NEXTAUTH_URL="https://www.bell24h.com" >> .env.production.template
echo NEXTAUTH_SECRET="your-production-nextauth-secret-32-chars" >> .env.production.template
echo. >> .env.production.template
echo # JWT Configuration >> .env.production.template
echo JWT_SECRET="your-production-jwt-secret-32-chars" >> .env.production.template
echo. >> .env.production.template
echo # AI Integration Keys >> .env.production.template
echo OPENAI_API_KEY="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" >> .env.production.template
echo NANO_BANANA_API_KEY="AIzaSyC-XH19RV9PgHAgTmduVcEd2IeMz8iwvac" >> .env.production.template
echo. >> .env.production.template
echo # n8n Workflow Automation >> .env.production.template
echo N8N_WEBHOOK_URL="https://n8n.bell24h.com/webhook/bell24h" >> .env.production.template
echo N8N_API_URL="https://n8n.bell24h.com/api" >> .env.production.template
echo. >> .env.production.template
echo # Payment Gateway (Production) >> .env.production.template
echo RAZORPAY_KEY_ID="rzp_live_your-production-key-id" >> .env.production.template
echo RAZORPAY_KEY_SECRET="your-production-razorpay-secret" >> .env.production.template
echo STRIPE_PUBLIC_KEY="pk_live_your-production-stripe-key" >> .env.production.template
echo STRIPE_SECRET_KEY="sk_live_your-production-stripe-secret" >> .env.production.template
echo. >> .env.production.template
echo # Production Flags >> .env.production.template
echo NODE_ENV="production" >> .env.production.template
echo NEXT_PUBLIC_DEBUG="false" >> .env.production.template
echo NEXT_PUBLIC_ENABLE_AI_FEATURES="true" >> .env.production.template
echo NEXT_PUBLIC_ENABLE_VOICE_RFQ="true" >> .env.production.template
echo NEXT_PUBLIC_ENABLE_N8N_AUTOMATION="true" >> .env.production.template

echo ✅ Production environment template created

echo.
echo 📋 Step 5: DNS Configuration Checklist
echo =====================================
echo.
echo ✅ DNS Records to Configure:
echo.
echo 1. Root Domain (bell24h.com):
echo    - Type: A Record
echo    - Name: @
echo    - Value: 76.76.19.61
echo    - TTL: 3600
echo.
echo 2. WWW Subdomain (www.bell24h.com):
echo    - Type: CNAME
echo    - Name: www
echo    - Value: cname.vercel-dns.com
echo    - TTL: 3600
echo.
echo 3. n8n Subdomain (n8n.bell24h.com):
echo    - Type: CNAME
echo    - Name: n8n
echo    - Value: cname.vercel-dns.com
echo    - TTL: 3600
echo.

echo 📋 Step 6: Vercel Dashboard Configuration
echo ========================================
echo.
echo 1. Go to Vercel Dashboard
echo 2. Select your Bell24h project
echo 3. Go to Settings > Domains
echo 4. Add domains:
echo    - bell24h.com
echo    - www.bell24h.com
echo    - n8n.bell24h.com
echo 5. Configure DNS records as shown above
echo 6. Wait for SSL certificate generation
echo 7. Test domain accessibility
echo.

echo 📋 Step 7: Testing DNS Configuration
echo ====================================
echo.

echo Creating DNS test script...
echo @echo off > test-dns.bat
echo echo 🧪 Testing Bell24h DNS Configuration... >> test-dns.bat
echo echo. >> test-dns.bat
echo echo Testing bell24h.com... >> test-dns.bat
echo nslookup bell24h.com >> test-dns.bat
echo echo. >> test-dns.bat
echo echo Testing www.bell24h.com... >> test-dns.bat
echo nslookup www.bell24h.com >> test-dns.bat
echo echo. >> test-dns.bat
echo echo Testing n8n.bell24h.com... >> test-dns.bat
echo nslookup n8n.bell24h.com >> test-dns.bat
echo echo. >> test-dns.bat
echo echo ✅ DNS test completed >> test-dns.bat
echo pause >> test-dns.bat

echo ✅ DNS test script created

echo.
echo 🎉 DNS CONFIGURATION GUIDE COMPLETE!
echo ====================================
echo.
echo 📋 What's been prepared:
echo ✅ DNS records configuration guide
echo ✅ Updated vercel.json with security headers
echo ✅ Production environment template
echo ✅ Vercel dashboard configuration steps
echo ✅ DNS testing script
echo.
echo 🚀 Next Steps:
echo 1. Configure DNS records in your domain registrar
echo 2. Add domains in Vercel dashboard
echo 3. Set environment variables in Vercel
echo 4. Deploy and test
echo.
echo 🌐 URLs after configuration:
echo - Main site: https://www.bell24h.com
echo - Root domain: https://bell24h.com (redirects to www)
echo - n8n server: https://n8n.bell24h.com
echo.
echo ⏱️ DNS propagation time: 5-30 minutes
echo.
pause
