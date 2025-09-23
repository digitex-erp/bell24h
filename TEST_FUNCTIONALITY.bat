@echo off
echo ========================================
echo TESTING ALL BELL24H FUNCTIONALITY
echo ========================================

echo Testing Homepage...
curl -s -o nul -w "Homepage: %%{http_code}\n" http://localhost:3000/

echo Testing Categories Page...
curl -s -o nul -w "Categories: %%{http_code}\n" http://localhost:3000/categories

echo Testing Pricing Page...
curl -s -o nul -w "Pricing: %%{http_code}\n" http://localhost:3000/pricing

echo Testing Negotiation Page...
curl -s -o nul -w "Negotiations: %%{http_code}\n" http://localhost:3000/negotiation

echo Testing AI Features...
curl -s -o nul -w "AI Explainability: %%{http_code}\n" http://localhost:3000/ai-explainability
curl -s -o nul -w "Risk Scoring: %%{http_code}\n" http://localhost:3000/risk-scoring
curl -s -o nul -w "Market Data: %%{http_code}\n" http://localhost:3000/market-data

echo Testing Legal Pages...
curl -s -o nul -w "Escrow Terms: %%{http_code}\n" http://localhost:3000/legal/escrow-terms
curl -s -o nul -w "Wallet Terms: %%{http_code}\n" http://localhost:3000/legal/wallet-terms

echo Testing Authentication...
curl -s -o nul -w "Login Page: %%{http_code}\n" http://localhost:3000/auth/login

echo Testing Dashboard...
curl -s -o nul -w "Dashboard: %%{http_code}\n" http://localhost:3000/dashboard

echo Testing Wallet...
curl -s -o nul -w "Wallet: %%{http_code}\n" http://localhost:3000/dashboard/wallet

echo Testing Video RFQ...
curl -s -o nul -w "Video RFQ: %%{http_code}\n" http://localhost:3000/video-rfq

echo Testing Fintech...
curl -s -o nul -w "Fintech: %%{http_code}\n" http://localhost:3000/fintech

echo.
echo ========================================
echo FUNCTIONALITY TEST COMPLETE!
echo ========================================
echo.
echo All pages should return 200 status codes.
echo If any page returns 404, there may be an issue.
echo.
echo Manual Testing Checklist:
echo - Homepage loads with solid colors (no gradients)
echo - Categories page shows proper layout
echo - Pricing page shows "Pricing Plans" (no "Beating IndiaMART")
echo - Negotiation page accessible from navigation
echo - AI features pages load correctly
echo - Legal pages are accessible
echo - All buttons and CTAs work
echo - Branding logo visible on all pages
echo - 1200+ RFQ mock data available
echo - Payment gateway legal pages ready
echo.
pause
