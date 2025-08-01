#!/bin/bash
# 🎯 Bell24h Category Audit Script
# Based on systematic audit framework

set -e

SITE_URL="https://bell24h-v1.vercel.app"
AUDIT_DIR="audit-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🔍 Bell24h Category Audit Starting..."
echo "Site: $SITE_URL"
echo "Timestamp: $TIMESTAMP"

# Create audit directory
mkdir -p "$AUDIT_DIR"

# 1. Fast 404 scan
echo "1️⃣ Running fast 404 scan..."
npx broken-link-checker "$SITE_URL" --recursive --exclude-external > "$AUDIT_DIR/404-scan-$TIMESTAMP.txt" 2>&1

# Count broken links
BROKEN_LINKS=$(grep -c "BROKEN" "$AUDIT_DIR/404-scan-$TIMESTAMP.txt" || echo "0")
echo "Found $BROKEN_LINKS broken links"

# 2. Build verification
echo "2️⃣ Verifying build..."
npm run build > "$AUDIT_DIR/build-log-$TIMESTAMP.txt" 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed - check build-log-$TIMESTAMP.txt"
fi

# 3. Check generateStaticParams
echo "3️⃣ Checking generateStaticParams..."
if grep -r "generateStaticParams" client/src/app/categories/ > /dev/null; then
    echo "✅ generateStaticParams found"
else
    echo "❌ generateStaticParams missing - add to dynamic routes"
fi

# 4. Performance test
echo "4️⃣ Testing performance..."
TEST_URLS=(
    "$SITE_URL/categories"
    "$SITE_URL/categories/automotive"
    "$SITE_URL/categories/electronics"
)

for url in "${TEST_URLS[@]}"; do
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$url")
    RESPONSE_CODE=$(curl -o /dev/null -s -w "%{http_code}" "$url")
    echo "$url - $RESPONSE_CODE ($RESPONSE_TIME s)"
done

# 5. Generate summary
echo "5️⃣ Generating summary..."
cat > "$AUDIT_DIR/summary-$TIMESTAMP.md" << EOF
# Bell24h Audit Summary - $TIMESTAMP

## Results
- Broken Links: $BROKEN_LINKS
- Build Status: $([ -f "client/.next" ] && echo "✅ Success" || echo "❌ Failed")
- Performance: See individual URL results above

## Next Steps
$([ "$BROKEN_LINKS" -gt 0 ] && echo "🚨 Fix $BROKEN_LINKS broken links immediately")
$([ ! -f "client/.next" ] && echo "🚨 Fix build errors immediately")

## Files Generated
- 404 Scan: 404-scan-$TIMESTAMP.txt
- Build Log: build-log-$TIMESTAMP.txt
- Summary: summary-$TIMESTAMP.md
EOF

echo "✅ Audit complete - check audit-results/ directory" 