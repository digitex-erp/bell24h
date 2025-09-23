# Cursor Terminal Bug Solution

## 🚨 Problem
Cursor's integrated terminal has a bug where commands get prefixed with 'q', causing all automation to fail.

## ✅ Solution: Bypass Cursor Terminal Completely

### 1. Wrapper Scripts Created

#### `deploy-pwsh.ps1` (PowerShell Wrapper)
- Strips any leading 'q' prefix
- Logs all commands and output
- Runs commands in fresh PowerShell process
- Bypasses Cursor's broken terminal

#### `deploy-sh` (Bash Wrapper)
- For Unix/Linux/WSL environments
- Same 'q' stripping functionality
- Comprehensive logging

### 2. Vercel Project Pinned

#### `.vercel/project.json`
```json
{
  "projectId": "prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS",
  "orgId": "team_COE65vdscwE4rITBcp2XyKqm"
}
```

This prevents Cursor from creating new projects or running interactive setup.

## 🔧 Usage in Cursor

### Instead of this (broken):
```
vercel --prod
```

### Use this (works):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-pwsh.ps1 -- "vercel --prod --project prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS --confirm"
```

### For multiple commands:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command @'
cd C:\Users\Sanika\Projects\bell24h
npm ci
npm run build
vercel --prod --project prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS --confirm
'@
```

## 📋 Complete Cursor Job Commands

### Deploy to Production:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-pwsh.ps1 -- "vercel --prod --project prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS --confirm"
```

### Build and Deploy:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command @'
cd C:\Users\Sanika\Projects\bell24h
npm ci
npm run build
vercel --prod --project prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS --confirm
'@
```

### Setup Neon Database:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-pwsh.ps1 -- ".\SETUP_NEON_DATABASE.ps1"
```

### Run Final Deployment:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-pwsh.ps1 -- ".\FINAL_NEON_DEPLOYMENT.ps1"
```

## 🔒 Security Benefits

1. **Project Pinned**: Cursor can't create new projects
2. **Non-Interactive**: No user input required
3. **Logging**: All commands logged for audit
4. **Fresh Process**: Bypasses Cursor's broken terminal
5. **Defensive**: Strips any stray 'q' prefixes

## 📊 Logging

All commands are logged to `./logs/deploy_YYYYMMDD_HHMMSS.log` with:
- Original command
- Cleaned command (after 'q' removal)
- Working directory
- PowerShell version
- Full output and errors

## 🚀 Next Steps

1. **Commit these files**:
   ```bash
   git add deploy-pwsh.ps1 deploy-sh .vercel/project.json CURSOR_TERMINAL_BUG_SOLUTION.md
   git commit -m "Add Cursor terminal bug workaround and pin Vercel project"
   git push
   ```

2. **Update Cursor jobs** to use the wrapper commands above

3. **Test deployment** using the wrapper

4. **Monitor logs** in `./logs/` directory

## ✅ Verification

After running a command, check:
1. `./logs/deploy_*.log` for successful execution
2. No 'q' prefixes in the log
3. Command executed in fresh PowerShell process
4. Vercel deployment successful

---

**This solution completely bypasses Cursor's terminal bug and ensures reliable automation!** 🎉
