# MCP Configuration for Bell24H.com

This document provides instructions for setting up and using the Model Context Protocol (MCP) configuration for the Bell24H.com project.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git

## Setup Instructions

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/Bell-repogit/Bell24HDashboard.git
   cd Bell24HDashboard
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env` if it doesn't exist
   - Update the environment variables in `.env` as needed
   - Make sure to set your `GITHUB_TOKEN` for GitHub integration

3. **Install MCP servers**:
   ```bash
   chmod +x scripts/setup-mcp.sh
   ./scripts/setup-mcp.sh
   ```

## Available MCP Servers

| Server | Description | Port |
|--------|-------------|------|
| GitHub | GitHub integration | - |
| Documentation | Serves project documentation | 8080 |
| Code Analysis | Static code analysis | - |
| Testing | Test runner and coverage | - |
| CI/CD | Continuous Integration/Deployment | - |
| Monitoring | Application monitoring | 9090 |

## Starting MCP Servers

To start all configured MCP servers:

```bash
mcp start
```

To start a specific server:

```bash
mcp start <server-name>
```

## Verifying the Setup

1. Documentation server: http://localhost:8080
2. Monitoring dashboard: http://localhost:9090

## Troubleshooting

- If you encounter permission issues, try running the setup script with `sudo`
- Make sure all required ports (8080, 9090) are available
- Check the logs in the terminal for any error messages

## Updating the Configuration

1. Edit `mcp_config.json` to modify server configurations
2. Restart the MCP servers for changes to take effect

## Security Notes

- Never commit sensitive information (like API keys) to version control
- Keep your `.env` file in `.gitignore`
- Use environment variables for all sensitive configuration
