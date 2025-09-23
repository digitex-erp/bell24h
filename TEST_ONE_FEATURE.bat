@echo off
echo ========================================
echo TESTING ONE FEATURE - HOMEPAGE FUNCTIONALITY
echo ========================================

echo [1/5] Testing Homepage Load...
curl -s -o nul -w "Homepage Status: %%{http_code}\n" http://localhost:3000/

echo [2/5] Testing Categories Page...
curl -s -o nul -w "Categories Status: %%{http_code}\n" http://localhost:3000/categories

echo [3/5] Testing Pricing Page...
curl -s -o nul -w "Pricing Status: %%{http_code}\n" http://localhost:3000/pricing

echo [4/5] Testing Negotiation Page...
curl -s -o nul -w "Negotiation Status: %%{http_code}\n" http://localhost:3000/negotiation

echo [5/5] Testing AI Features...
curl -s -o nul -w "AI Explainability: %%{http_code}\n" http://localhost:3000/ai-explainability
curl -s -o nul -w "Risk Scoring: %%{http_code}\n" http://localhost:3000/risk-scoring
curl -s -o nul -w "Market Data: %%{http_code}\n" http://localhost:3000/market-data

echo.
echo ========================================
echo FEATURE TEST RESULTS
echo ========================================
echo.
echo If all pages return 200, the basic functionality works.
echo If any page returns 404, that feature is broken.
echo.
echo Manual Testing Required:
echo 1. Open http://localhost:3000 in browser
echo 2. Check if homepage loads with solid colors (no gradients)
echo 3. Check if "Beating IndiaMART" text is removed
echo 4. Check if Bell24h logo is visible
echo 5. Check if navigation links work
echo 6. Check if all buttons are clickable
echo.
pause
