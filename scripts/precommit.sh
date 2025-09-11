#!/bin/bash
# Pre-commit hook to prevent committing secrets and sensitive files

echo "🔍 Running pre-commit security checks..."

# Check for .env files
if git diff --cached --name-only | grep -E '\.env$|\.env\.local|\.env\.production|\.env\.development|\.env\.test'; then
  echo "❌ ERROR: .env files cannot be committed. Remove them from staging."
  echo "   Files detected:"
  git diff --cached --name-only | grep -E '\.env$|\.env\.local|\.env\.production|\.env\.development|\.env\.test'
  echo ""
  echo "   To fix:"
  echo "   git reset HEAD *.env *.env.local *.env.production *.env.development *.env.test"
  exit 1
fi

# Check for potential API keys in code
if git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -l -E '(sk_|pk_|re_|rzp_|468517|dGNCnq2P)'; then
  echo "❌ ERROR: Potential API keys detected in code files."
  echo "   Please remove any hardcoded API keys from your code."
  echo "   Use environment variables instead."
  exit 1
fi

# Check for secrets directory
if git diff --cached --name-only | grep -E '^secrets/|^\.secrets/'; then
  echo "❌ ERROR: Secrets directory cannot be committed."
  echo "   Remove secrets/ or .secrets/ from staging."
  exit 1
fi

# Check for certificate files
if git diff --cached --name-only | grep -E '\.(pem|key|crt|p12|pfx)$'; then
  echo "❌ ERROR: Certificate files cannot be committed."
  echo "   Remove certificate files from staging."
  exit 1
fi

echo "✅ Pre-commit security checks passed!"
echo "🚀 Safe to commit to GitHub → Vercel auto-deployment"
