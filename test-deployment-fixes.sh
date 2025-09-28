#!/bin/bash
echo "=== TESTING DEPLOYMENT FIXES ==="

echo ""
echo "Step 1: Testing Next.js build..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi
echo "✓ Build successful!"

echo ""
echo "Step 2: Testing Prisma generation..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Prisma generation failed!"
    exit 1
fi
echo "✓ Prisma generation successful!"

echo ""
echo "Step 3: Testing TypeScript compilation..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "ERROR: TypeScript compilation failed!"
    exit 1
fi
echo "✓ TypeScript compilation successful!"

echo ""
echo "=== ALL TESTS PASSED! ==="
echo "Your deployment should now work."
echo ""
echo "Next steps:"
echo "1. Add GitHub secrets from .env.github-actions"
echo "2. Push to GitHub"
echo "3. Check GitHub Actions tab"
echo ""
