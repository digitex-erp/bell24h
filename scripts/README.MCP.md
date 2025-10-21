MCP helper scripts

This folder contains small PowerShell helpers to start Model Context Protocol (MCP) servers used during local development.

Files
- `mcp-start.ps1` - Start a specific MCP server by name. Usage:
  - `.iles\scripts\mcp-start.ps1 -Server documentation`
  - `.iles\scripts\mcp-start.ps1 -Server documentation -NoNewWindow`

- `mcp-start-all.ps1` - Launches a subset of MCP servers in separate PowerShell windows (documentation, playwright, code-analysis, testing, monitoring).

Available server names (case-insensitive):
GitKraken, Playwright, github, documentation, code-analysis, testing, ci-cd, monitoring

Notes
- The scripts call `npx` for servers that are distributed as npm packages. Ensure Node.js and npm are available in your PATH.
- If you use GitKraken integration, confirm the path in `mcp-start.ps1` points to `gk.exe` on your machine.
- For servers that require secrets (for example, GitHub integration), set the environment variables first in your PowerShell session, e.g.:
  ```powershell
  $env:GITHUB_TOKEN = "ghp_..."
  .\scripts\mcp-start.ps1 -Server github
  ```

Feedback
If you want these converted to npm scripts or to run headlessly in the current console, tell me which mode you prefer and I will add those variants.
