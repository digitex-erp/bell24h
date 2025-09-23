@echo off
echo ========================================
echo TESTING ALL BELL24H FUNCTIONALITY
echo ========================================

echo [1/6] Testing Homepage...
curl -s -o nul -w "Homepage: %%{http_code}\n" http://localhost:3000/

echo [2/6] Testing Categories Page...
curl -s -o nul -w "Categories: %%{http_code}\n" http://localhost:3000/categories

echo [3/6] Testing Pricing Page...
curl -s -o nul -w "Pricing: %%{http_code}\n" http://localhost:3000/pricing

echo [4/6] Testing Negotiation Page...
curl -s -o nul -w "Negotiations: %%{http_code}\n" http://localhost:3000/negotiation

echo [5/6] Testing AI Features...
curl -s -o nul -w "AI Explainability: %%{http_code}\n" http://localhost:3000/ai-explainability
curl -s -o nul -w "Risk Scoring: %%{http_code}\n" http://localhost:3000/risk-scoring
curl -s -o nul -w "Market Data: %%{http_code}\n" http://localhost:3000/market-data

echo [6/6] Testing Legal Pages...
curl -s -o nul -w "Escrow Terms: %%{http_code}\n" http://localhost:3000/legal/escrow-terms
curl -s -o nul -w "Wallet Terms: %%{http_code}\n" http://localhost:3000/legal/wallet-terms

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
echo.
pause
