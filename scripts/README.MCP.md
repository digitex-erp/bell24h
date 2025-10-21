Auto publish helper
===================

This folder contains a small, interactive PowerShell helper `auto_publish.ps1` to assist non-coders with common repository housekeeping and publishing tasks:

- Move private key-like files out of the repository into a secure folder under your user profile (e.g. `C:\Users\Sanika\keys`).
- Ensure `.gitignore` contains recommended entries (virtualenvs, node_modules, keys).
- Untrack common large folders (`backend/.venv`, `frontend/node_modules`) if present.
- Optionally create a GitHub repo using the `gh` CLI, set `origin`, push the current branch, and open a PR.

How to use (PowerShell):

1. Open PowerShell and change directory to the repository root:

```powershell
cd C:\Project\Bell24h
```

2. Run the helper (it is interactive and will ask for confirmation):

```powershell
.\scripts\auto_publish.ps1
```

3. Follow prompts to move keys, update .gitignore, push, and create PR. The script will not push or create a repository without your confirmation.

Notes & safety
---------------
- The script will NOT upload or share your keys. It only moves files on your local machine.
- You must have `git` installed and configured. For PR creation and repo creation, you must also be logged into the `gh` CLI (run `gh auth login`).
- If you prefer to use SSH for git pushes, add your public key (from `C:\Users\<you>\keys`) to GitHub at https://github.com/settings/keys.

Quick deployment snippet (manual step, for CI or someone with deploy access)
--------------------------------------------------------------------------

Linux (systemd-managed backend):

```bash
# on the server as deploy user
cd /var/www/bell24h
git pull origin main
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
# restart uvicorn/systemd service
sudo systemctl restart bell24h.service
```

Windows (fallback):

```powershell
cd C:\inetpub\www\bell24h
git pull origin main
.\backend\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
# restart the Windows service or scheduled task that runs UVicorn
```

If you'd like, I can extend the script to perform the server deployment steps — but I will not run or store your keys or credentials.
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
