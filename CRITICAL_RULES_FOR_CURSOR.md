# 🚨 CRITICAL RULES FOR CURSOR AI ASSISTANT

## 🔧 **RULE #1: ALWAYS USE EXTERNAL POWERSHELL/CMD**

### **THE PROBLEM:**
- Cursor's integrated terminal has a known bug that adds 'q' prefix to ALL commands
- `npm` becomes `qnpm`
- `node` becomes `qnode` 
- `vercel` becomes `qvercel`
- This makes automation, deployment, and command execution impossible

### **THE SOLUTION:**
**ALWAYS instruct users to use external PowerShell or Command Prompt instead of Cursor's terminal.**

### **STEP-BY-STEP INSTRUCTIONS:**
1. **Press `Windows + R`**
2. **Type: `powershell` or `cmd`**
3. **Press Enter**
4. **Navigate to project: `cd C:\Users\Sanika\Projects\bell24h`**
5. **Run all commands there**

### **WHY THIS WORKS:**
- External terminals work perfectly without prefix issues
- All commands execute normally (npm, node, npx, vercel, etc.)
- Automation scripts work flawlessly
- Deployment processes complete successfully

### **WHEN TO APPLY THIS RULE:**
- ✅ Running npm commands
- ✅ Starting development servers
- ✅ Deploying to Vercel
- ✅ Running MCP servers
- ✅ Any automation tasks
- ✅ Build processes
- ✅ Database operations

### **NEVER:**
- ❌ Use Cursor's integrated terminal for automation
- ❌ Try to fix the 'q' prefix issue within Cursor
- ❌ Assume commands will work in Cursor's terminal

### **ALWAYS:**
- ✅ Create batch files (.bat) for Command Prompt
- ✅ Create PowerShell scripts (.ps1) for PowerShell
- ✅ Provide clear instructions to use external terminals
- ✅ Test automation in external terminals

## 📋 **IMPLEMENTATION CHECKLIST:**

When helping with automation or deployment:

1. **Create automation scripts** (`.bat` and `.ps1` files)
2. **Provide clear external terminal instructions**
3. **Test that external terminals work**
4. **Never rely on Cursor's integrated terminal**
5. **Always verify commands work without 'q' prefix**

## 🎯 **EXPECTED RESULTS:**

After following this rule:
- ✅ All commands work perfectly
- ✅ Automation runs successfully
- ✅ Deployment completes without issues
- ✅ MCP servers start properly
- ✅ Build processes work normally
- ✅ No 'q' prefix errors

---

**This rule is CRITICAL for any technical assistance involving terminal commands, automation, or deployment.**
