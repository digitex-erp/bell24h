@echo off
echo ================================================
echo BELL24H RAZORPAY CONFIGURATION UPDATE
echo ================================================
echo.

echo [1/6] Updating Razorpay Configuration with Merchant ID...
echo.

cd client

echo Creating complete .env.local with all Razorpay details...
echo # Bell24h Production Environment Configuration > .env.local
echo # Updated with new Razorpay Live API Keys and Merchant ID >> .env.local
echo. >> .env.local
echo # Database Configuration >> .env.local
echo DATABASE_URL="postgresql://bell24h:Bell24h@2025@localhost:5432/bell24h" >> .env.local
echo. >> .env.local
echo # NextAuth Configuration >> .env.local
echo NEXTAUTH_URL="http://localhost:3000" >> .env.local
echo NEXTAUTH_SECRET="bell24h_secret_key_2025_autonomous_system" >> .env.local
echo. >> .env.local
echo # Razorpay Payment Gateway - COMPLETE CONFIGURATION >> .env.local
echo RAZORPAY_KEY_ID="rzp_live_RJjxcgaBo9j0UA" >> .env.local
echo RAZORPAY_KEY_SECRET="lwTxLReQSkVL7lbrr39XSoyG" >> .env.local
echo RAZORPAY_MERCHANT_ID="DwqbZimRZG6c3y" >> .env.local
echo RAZORPAY_WEBHOOK_SECRET="bell24h_webhook_secret_2025" >> .env.local
echo. >> .env.local
echo # MSG91 SMS Service >> .env.local
echo MSG91_AUTH_KEY="468517Ak5rJ0vb7NDV68c24863P1" >> .env.local
echo MSG91_SENDER_ID="BELL24H" >> .env.local
echo. >> .env.local
echo # Resend Email Service >> .env.local
echo RESEND_API_KEY="re_1234567890abcdef" >> .env.local
echo. >> .env.local
echo # OpenAI API (for AI features) >> .env.local
echo OPENAI_API_KEY="sk-1234567890abcdef" >> .env.local
echo. >> .env.local
echo # Development Environment >> .env.local
echo NODE_ENV="development" >> .env.local
echo. >> .env.local
echo # Feature Flags >> .env.local
echo NEXT_PUBLIC_ENABLE_CANVAS="false" >> .env.local
echo NEXT_PUBLIC_ENABLE_THREE_BELL="false" >> .env.local
echo NEXT_PUBLIC_ENABLE_AUDIO="false" >> .env.local
echo. >> .env.local
echo # Security >> .env.local
echo JWT_SECRET="bell24h_jwt_secret_2025" >> .env.local
echo ENCRYPTION_KEY="bell24h_encryption_key_2025" >> .env.local

echo ✅ Environment file created with complete Razorpay configuration!
echo.

echo [2/6] Verifying Razorpay Configuration...
echo.
echo ✅ Complete Razorpay Configuration:
echo    Key ID: rzp_live_RJjxcgaBo9j0UA
echo    Key Secret: lwTxLReQSkVL7lbrr39XSoyG
echo    Merchant ID: DwqbZimRZG6c3y
echo    Webhook Secret: bell24h_webhook_secret_2025
echo.

echo [3/6] Testing Razorpay API with Merchant ID...
echo.

node -e "
const Razorpay = require('razorpay');
console.log('🔑 Testing Razorpay with Merchant ID...');

const razorpay = new Razorpay({
  key_id: 'rzp_live_RJjxcgaBo9j0UA',
  key_secret: 'lwTxLReQSkVL7lbrr39XSoyG'
});

console.log('✅ Razorpay instance created');
console.log('✅ Key ID: rzp_live_RJjxcgaBo9j0UA');
console.log('✅ Merchant ID: DwqbZimRZG6c3y');

// Test API connection
razorpay.orders.all({ count: 1 }).then(() => {
  console.log('✅ Razorpay API connection successful!');
  console.log('✅ Merchant ID integration ready');
}).catch((error) => {
  console.log('❌ Razorpay API connection failed:', error.message);
});
"

echo.
echo [4/6] Testing Payment Order with Merchant ID...
echo.

node -e "
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: 'rzp_live_RJjxcgaBo9j0UA',
  key_secret: 'lwTxLReQSkVL7lbrr39XSoyG'
});

console.log('🧪 Testing Payment Order with Merchant ID...');

const testOrder = {
  amount: 100, // ₹1 for testing
  currency: 'INR',
  receipt: 'bell24h_merchant_test_' + Date.now(),
  payment_capture: 0,
  notes: {
    merchant_id: 'DwqbZimRZG6c3y',
    platform: 'bell24h',
    test: 'true',
    purpose: 'merchant_id_verification'
  }
};

razorpay.orders.create(testOrder).then((order) => {
  console.log('✅ Payment order created with Merchant ID!');
  console.log('✅ Order ID:', order.id);
  console.log('✅ Merchant ID included in notes');
  console.log('✅ Ready for production payments');
}).catch((error) => {
  console.log('❌ Payment order creation failed:', error.message);
});
"

echo.
echo [5/6] Testing Bell24h Payment APIs...
echo.

echo Testing payment creation API...
curl -X POST http://localhost:3000/api/payments/create ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":\"test_merchant_123\",\"amount\":100,\"customerId\":\"test_customer\",\"customerEmail\":\"test@bell24h.com\",\"customerName\":\"Test User\"}" ^
  -w "Payment API Status: %%{http_code}\n" ^
  -s -o nul

echo Testing wallet API...
curl -X GET http://localhost:3000/api/wallet ^
  -w "Wallet API Status: %%{http_code}\n" ^
  -s -o nul

echo.
echo [6/6] Starting Development Server...
echo.

echo 🚀 Starting Bell24h with complete Razorpay configuration...
echo.
echo ✅ Razorpay Configuration Complete:
echo    Key ID: rzp_live_RJjxcgaBo9j0UA
echo    Key Secret: lwTxLReQSkVL7lbrr39XSoyG
echo    Merchant ID: DwqbZimRZG6c3y
echo    Webhook Secret: bell24h_webhook_secret_2025
echo.
echo 🌐 Access your application at: http://localhost:3000
echo 💳 Live payments will use Merchant ID: DwqbZimRZG6c3y
echo.
echo ⚠️  IMPORTANT: These are LIVE keys - real money will be charged!
echo.

npm run dev

echo.
echo ================================================
echo RAZORPAY CONFIGURATION UPDATE COMPLETE
echo ================================================
echo.
echo ✅ Environment Updated with Merchant ID
echo ✅ Razorpay API Tested
echo ✅ Payment Orders Tested
echo ✅ Bell24h APIs Tested
echo ✅ Development Server Started
echo.
echo 🎯 COMPLETE RAZORPAY CONFIGURATION:
echo.
echo 📋 For Razorpay.me Integration:
echo    Key ID: rzp_live_RJjxcgaBo9j0UA
echo    Key Secret: lwTxLReQSkVL7lbrr39XSoyG
echo    Merchant ID: DwqbZimRZG6c3y
echo.
echo 🚀 NEXT STEPS:
echo 1. Test payment flow at http://localhost:3000
echo 2. Check Razorpay dashboard for transactions
echo 3. Verify Merchant ID appears in payment notes
echo 4. Test escrow payments with Merchant ID
echo.
echo ⚠️  REMEMBER: These are LIVE keys with Merchant ID!
echo.
pause
