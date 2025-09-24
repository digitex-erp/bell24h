# GitKraken MCP Setup Guide

This guide will help you set up GitKraken MCP (Model Context Protocol) server for integration with Cursor AI.

## What is GitKraken MCP?

GitKraken MCP is a Model Context Protocol server that allows AI assistants like Cursor to interact with Git repositories through GitKraken's API. It enables features like:

- Git status checking
- Commit history viewing
- Branch management
- File diff viewing
- Repository analysis

## Prerequisites

1. **Node.js** (v14 or later)
2. **GitKraken Account** with API access
3. **Cursor IDE** with MCP support
4. **Git** installed and configured

## Quick Setup (5 minutes)

### Step 1: Get GitKraken API Token

1. Go to [GitKraken Developer Portal](https://app.gitkraken.com/user-profile/tokens)
2. Sign in to your GitKraken account
3. Click "Create Token"
4. Give it a descriptive name (e.g., "Cursor MCP")
5. Copy the generated token

### Step 2: Run Setup Script

Choose one of the setup scripts:

**Windows (Command Prompt):**
```cmd
setup-gitkraken-mcp.bat
```

**Windows (PowerShell):**
```powershell
.\setup-gitkraken-mcp.ps1
```

### Step 3: Configure Environment Variables

1. Open the created `.env.local` file
2. Replace `your_gitkraken_token_here` with your actual API token
3. Add your workspace ID if you have one (optional)

```env
GITKRAKEN_API_TOKEN=gk_your_actual_token_here
GITKRAKEN_WORKSPACE_ID=your_workspace_id_here
```

### Step 4: Restart Cursor

1. Close Cursor completely
2. Wait a few seconds
3. Restart Cursor
4. The GitKraken MCP server should now be available

## Manual Setup (Advanced)

If you prefer to set up manually:

### Step 1: Install Dependencies

```bash
npm install @modelcontextprotocol/sdk
```

### Step 2: Configure MCP Server

1. Open Cursor Settings (Ctrl/Cmd + ,)
2. Navigate to "MCP" or "Model Context Protocol" settings
3. Add a new MCP server with the following configuration:

```json
{
  "name": "GitKraken",
  "command": "node",
  "args": ["/path/to/gitkraken-mcp-server.js"],
  "env": {
    "GITKRAKEN_API_TOKEN": "your_token_here",
    "GITKRAKEN_WORKSPACE_ID": "your_workspace_id"
  }
}
```

### Step 3: Test the Server

```bash
node gitkraken-mcp-server.js
```

You should see: "GitKraken MCP server running on stdio"

## Available Tools

Once set up, you can use these GitKraken MCP tools in Cursor:

### 1. `git_status`
Get the current Git repository status
```javascript
// Shows all modified, staged, and untracked files
```

### 2. `git_log`
Get Git commit history
```javascript
// Parameters: path, limit (default: 10)
```

### 3. `git_diff`
Show Git diff for changes
```javascript
// Parameters: path, staged (boolean)
```

### 4. `git_branch`
List all Git branches
```javascript
// Shows local and remote branches
```

### 5. `git_commit`
Create a Git commit
```javascript
// Parameters: path, message, all (boolean)
```

## Troubleshooting

### "fetch failed" Error

This usually means:

1. **Missing Dependencies:**
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **Environment Variables Not Set:**
   - Check `.env.local` file exists
   - Verify `GITKRAKEN_API_TOKEN` is set
   - Restart Cursor after making changes

3. **Permission Issues:**
   - Make sure Node.js can execute the server
   - Try running the server manually first

### "Authentication failed" Error

1. Verify your GitKraken API token is correct
2. Check if your token has expired
3. Generate a new token if needed

### "Workspace not found" Error

1. Set the `GITKRAKEN_WORKSPACE_ID` in `.env.local`
2. Or remove the environment variable to use default workspace

### Server Not Starting

1. **Test manually:**
   ```bash
   node gitkraken-mcp-server.js
   ```

2. **Check for errors** in the terminal output

3. **Verify Node.js version:**
   ```bash
   node --version  # Should be 14+
   ```

### Cursor Not Detecting Server

1. **Restart Cursor completely**
2. **Check MCP settings** in Cursor preferences
3. **Look for error messages** in Cursor console/logs
4. **Verify file paths** in MCP configuration

## Configuration Files

- `gitkraken-mcp-server.js` - Main MCP server implementation
- `mcp-gitkraken.json` - MCP server configuration
- `.env.local` - Environment variables (create this file)
- `setup-gitkraken-mcp.bat/ps1` - Automated setup scripts

## Security Notes

- Never commit API tokens to version control
- Use environment variables for all sensitive data
- Keep `.env.local` in `.gitignore`
- Rotate tokens regularly

## Getting Help

1. Check Cursor's MCP documentation
2. Review GitKraken's API documentation
3. Test individual components step by step
4. Check console logs for detailed error messages

## Advanced Configuration

For advanced users, you can modify:

- `gitkraken-mcp-server.js` - Add custom tools
- `mcp-gitkraken.json` - Change server settings
- Add additional environment variables as needed

## Integration with Bell24h Project

This GitKraken MCP setup is specifically configured for the Bell24h B2B marketplace project, providing seamless Git integration for:

- Repository management
- Code reviews
- Branch management
- Deployment tracking
- Team collaboration

---

**Setup Complete!** 🎉

Your GitKraken MCP server should now be working with Cursor. You can now use Git commands directly through the AI assistant interface.
