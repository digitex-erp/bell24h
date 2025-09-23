@echo off
echo ================================================
echo BELL24H RAZORPAY INTEGRATION TESTING
echo ================================================
echo.

echo [1/8] Updating Environment with New Razorpay Keys...
echo.

cd client

echo Creating .env.local with new Razorpay keys...
echo # Bell24h Production Environment Configuration > .env.local
echo # Updated with new Razorpay Live API Keys >> .env.local
echo. >> .env.local
echo # Database Configuration >> .env.local
echo DATABASE_URL="postgresql://bell24h:Bell24h@2025@localhost:5432/bell24h" >> .env.local
echo. >> .env.local
echo # NextAuth Configuration >> .env.local
echo NEXTAUTH_URL="http://localhost:3000" >> .env.local
echo NEXTAUTH_SECRET="bell24h_secret_key_2025_autonomous_system" >> .env.local
echo. >> .env.local
echo # Razorpay Payment Gateway - NEW LIVE KEYS >> .env.local
echo RAZORPAY_KEY_ID="rzp_live_RJjxcgaBo9j0UA" >> .env.local
echo RAZORPAY_KEY_SECRET="lwTxLReQSkVL7lbrr39XSoyG" >> .env.local
echo RAZORPAY_MERCHANT_ID="DwqbZimRZG6c3y" >> .env.local
echo. >> .env.local
echo # MSG91 SMS Service >> .env.local
echo MSG91_AUTH_KEY="468517Ak5rJ0vb7NDV68c24863P1" >> .env.local
echo MSG91_SENDER_ID="BELL24H" >> .env.local
echo. >> .env.local
echo # Development Environment >> .env.local
echo NODE_ENV="development" >> .env.local

echo ✅ Environment file created successfully!
echo.

echo [2/8] Installing Razorpay Dependencies...
echo.
npm install razorpay

echo [3/8] Testing Razorpay API Connection...
echo.
node -e "
const Razorpay = require('razorpay');
console.log('🔑 Testing Razorpay API Connection...');
console.log('');

const razorpay = new Razorpay({
  key_id: 'rzp_live_RJjxcgaBo9j0UA',
  key_secret: 'lwTxLReQSkVL7lbrr39XSoyG'
});

console.log('✅ Razorpay instance created successfully');
console.log('✅ Key ID: rzp_live_RJjxcgaBo9j0UA');
console.log('✅ Key Secret: lwTxLReQSkVL7lbrr39XSoyG');
console.log('');
console.log('🧪 Testing API connection...');

razorpay.orders.all({ count: 1 }).then(() => {
  console.log('✅ Razorpay API connection successful!');
  console.log('✅ Live keys are working correctly');
}).catch((error) => {
  console.log('❌ Razorpay API connection failed:', error.message);
  console.log('⚠️  Check if keys are correct and account is active');
});
"

echo.
echo [4/8] Testing Payment Creation API...
echo.

node -e "
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: 'rzp_live_RJjxcgaBo9j0UA',
  key_secret: 'lwTxLReQSkVL7lbrr39XSoyG'
});

console.log('🧪 Testing Payment Order Creation...');

const testOrder = {
  amount: 100, // ₹1 for testing
  currency: 'INR',
  receipt: 'test_order_' + Date.now(),
  payment_capture: 0,
  notes: {
    test: 'true',
    purpose: 'razorpay_integration_test'
  }
};

razorpay.orders.create(testOrder).then((order) => {
  console.log('✅ Test payment order created successfully!');
  console.log('✅ Order ID:', order.id);
  console.log('✅ Amount:', order.amount);
  console.log('✅ Currency:', order.currency);
  console.log('✅ Status:', order.status);
  console.log('');
  console.log('🎯 Razorpay Integration Test PASSED!');
}).catch((error) => {
  console.log('❌ Payment order creation failed:', error.message);
  console.log('⚠️  Check Razorpay account status and permissions');
});
"

echo.
echo [5/8] Testing Bell24h Payment API...
echo.

echo Testing local payment API endpoint...
curl -X POST http://localhost:3000/api/payments/create ^
  -H "Content-Type: application/json" ^
  -d "{\"orderId\":\"test_order_123\",\"amount\":100,\"customerId\":\"test_customer\",\"customerEmail\":\"test@example.com\",\"customerName\":\"Test User\"}" ^
  -w "Payment API Status: %%{http_code}\n" ^
  -s -o nul

echo.
echo [6/8] Testing Wallet API...
echo.

curl -X GET http://localhost:3000/api/wallet ^
  -w "Wallet API Status: %%{http_code}\n" ^
  -s -o nul

echo.
echo [7/8] Testing Upload Invoice API...
echo.

curl -X POST http://localhost:3000/api/upload/invoice ^
  -w "Upload Invoice API Status: %%{http_code}\n" ^
  -s -o nul

echo.
echo [8/8] Starting Development Server...
echo.

echo 🚀 Starting Bell24h with new Razorpay keys...
echo.
echo ✅ New Razorpay Live Keys Configured:
echo    Key ID: rzp_live_RJjxcgaBo9j0UA
echo    Key Secret: lwTxLReQSkVL7lbrr39XSoyG
echo    Merchant ID: DwqbZimRZG6c3y
echo.
echo 🌐 Access your application at: http://localhost:3000
echo 💳 Test payments will use live Razorpay account
echo.
echo ⚠️  IMPORTANT: These are LIVE keys - real money will be charged!
echo.

npm run dev

echo.
echo ================================================
echo RAZORPAY INTEGRATION TESTING COMPLETE
echo ================================================
echo.
echo ✅ Environment Updated
echo ✅ Razorpay Dependencies Installed  
echo ✅ API Connection Tested
echo ✅ Payment Creation Tested
echo ✅ Bell24h APIs Tested
echo ✅ Development Server Started
echo.
echo 🎯 NEXT STEPS:
echo 1. Test payment flow at http://localhost:3000
echo 2. Check Razorpay dashboard for test transactions
echo 3. Verify wallet functionality works
echo 4. Test escrow payments
echo.
echo ⚠️  REMEMBER: These are LIVE keys - use carefully!
echo.
pause
