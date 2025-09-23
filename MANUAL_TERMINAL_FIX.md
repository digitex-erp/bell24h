# 🚨 CURSOR TERMINAL FIX - MANUAL STEPS

## The Problem
Cursor's AI terminal is adding a 'q' prefix to ALL commands, making them fail.

## The Solution
You need to fix this manually because Cursor's terminal interface is interfering.

## Step-by-Step Fix:

### Step 1: Open Windows PowerShell Directly
1. Press `Windows + R`
2. Type `powershell`
3. Press Enter

### Step 2: Navigate to Your Project
```powershell
cd C:\Users\Sanika\Projects\bell24h
```

### Step 3: Remove the Q: Function
```powershell
Remove-Item function:Q: -Force -ErrorAction SilentlyContinue
```

### Step 4: Test Commands
```powershell
npm --version
node --version
dir
```

### Step 5: Create Permanent Fix
```powershell
# Add this to your PowerShell profile
$profilePath = $PROFILE
if (-not (Test-Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force
}

$fixCode = @"
# PERMANENT FIX: Remove Q: function on startup
if (Get-Command Q: -ErrorAction SilentlyContinue) {
    Remove-Item function:Q: -Force -ErrorAction SilentlyContinue
    Write-Host 'Q: function removed - terminal fixed!' -ForegroundColor Green
}
"@

Add-Content -Path $profilePath -Value $fixCode -Force
```

### Step 6: Test MCP Server
```powershell
# Install MCP if needed
npm install -g @modelcontextprotocol/server-filesystem

# Test MCP server
npx @modelcontextprotocol/server-filesystem --root C:\Users\Sanika\Projects\bell24h
```

## Alternative: Use Command Prompt
1. Press `Windows + R`
2. Type `cmd`
3. Press Enter
4. Navigate to your project: `cd C:\Users\Sanika\Projects\bell24h`
5. Run commands normally

## Why This Happens
Cursor's AI terminal has a bug where it adds 'q' prefix to commands. This is a known issue with some Cursor versions.

## After the Fix
- All commands will work normally
- MCP server will start properly
- Bell24h project will run smoothly
- No more 'q' prefix issues

## Test Your Fix
After applying the fix, test these commands:
```bash
npm --version
node --version
npm run dev
npx @modelcontextprotocol/server-filesystem
```

If they work without 'q' prefix, the fix is successful!
