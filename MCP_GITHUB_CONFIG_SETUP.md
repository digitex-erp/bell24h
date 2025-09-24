# 🔧 MCP GitHub Configuration Setup

## 📋 **STEP 1: GET GITHUB TOKEN**

1. Go to: https://github.com/settings/tokens/new
2. **Name:** "Bell24h MCP Access"
3. **Expiration:** 90 days
4. **Select scopes:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `security_events` (Read and write security events)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
5. **Generate token** and copy it (starts with `ghp_`)

## 📋 **STEP 2: UPDATE CURSOR MCP SETTINGS**

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "playwright-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "playwright-mcp"
      ]
    },
    "database-migration": {
      "command": "node",
      "args": [
        "mcp-database-migrator.js"
      ],
      "cwd": "${workspaceFolder}"
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN_HERE"
      }
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

## 📋 **STEP 3: RESTART CURSOR**

1. Close Cursor completely
2. Reopen Cursor
3. Verify MCP servers are active in the status bar

## 📋 **STEP 4: TEST MCP CONNECTION**

In Cursor chat, test:
```
@github list repositories for digitex-erp
@puppeteer navigate to github.com
```

## 🎯 **READY FOR AUTOMATION**

Once configured, you can run:
```
@github list security alerts for digitex-erp/bell24h
@puppeteer automate GitHub unblock process
@GitKraken push your 216 pages
```

Your Bell24h deployment will be automated! 🚀
