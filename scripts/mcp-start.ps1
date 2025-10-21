<#
Usage:
  # Start a single MCP server by name (runs in a new process window):
  .\scripts\mcp-start.ps1 -Server documentation

  # Start a server in the current window (synchronous):
  .\scripts\mcp-start.ps1 -Server documentation -NoNewWindow

Supported server names:
  GitKraken, Playwright, github, documentation, code-analysis, testing, ci-cd, monitoring

This script wraps the common `npx` commands used in the MCP config and sets expected env vars.
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$Server,
  [switch]$NoNewWindow
)

function Start-MCPProcess {
  param($File, $ArgList, $EnvVars)
  if ($EnvVars) {
    foreach ($k in $EnvVars.Keys) { ${env:$k} = $EnvVars[$k] }
  }

  if ($NoNewWindow) {
    & $File $ArgList
  } else {
    Start-Process -FilePath $File -ArgumentList $ArgList -NoNewWindow
  }
}

switch ($Server.ToLower()) {
  'gitkraken' {
    $gkPath = 'c:\Users\Sanika\AppData\Roaming\Cursor\User\globalStorage\eamodio.gitlens\gk.exe'
    if (Test-Path $gkPath) {
      if ($NoNewWindow) { & $gkPath mcp --host=cursor --source=gitlens --scheme=cursor } else { Start-Process -FilePath $gkPath -ArgumentList 'mcp','--host=cursor','--source=gitlens','--scheme=cursor' }
    } else { Write-Error "GitKraken binary not found at $gkPath. Update path or run GitKraken manually." }
  }
  'playwright' {
    Start-MCPProcess -File 'npx' -Args 'playwright-mcp' -EnvVars @{ NODE_ENV='development' }
  }
  'github' {
    Start-MCPProcess -File 'npx' -Args '-y @modelcontextprotocol/server-github' -EnvVars @{ GITHUB_TOKEN=$env:GITHUB_TOKEN; REPO_OWNER='Bell-repogit'; REPO_NAME='Bell24HDashboard' }
  }
  'documentation' {
    Start-MCPProcess -File 'npx' -Args '-y @mcp/server-documentation' -EnvVars @{ DOCS_PATH='docs'; DOCS_PORT='8080'; AUTO_RELOAD='true' }
  }
  'code-analysis' {
    Start-MCPProcess -File 'npx' -Args '-y @mcp/server-code-analysis' -EnvVars @{ RULESET='typescript-react'; THRESHOLD='warning' }
  }
  'testing' {
    Start-MCPProcess -File 'npx' -Args '-y @mcp/server-testing' -EnvVars @{ TEST_DIR='tests'; COVERAGE_DIR='coverage'; WATCH_MODE='true' }
  }
  'ci-cd' {
    Start-MCPProcess -File 'npx' -Args '-y mcp-server-cicd' -EnvVars @{ PLATFORM='github-actions'; BUILD_SCRIPT='npm run build'; TEST_SCRIPT='npm test' }
  }
  'monitoring' {
    Start-MCPProcess -File 'npx' -Args '-y mcp-server-monitoring' -EnvVars @{ METRICS_PORT='9090'; HEALTH_CHECK_PATH='/health'; LOG_LEVEL='info'; PROMETHEUS_ENABLED='true'; GRAFANA_DASHBOARD='./monitoring/grafana/dashboards'; METRICS_INTERVAL='15000'; ALERT_MANAGER_URL='http://localhost:9093'; ENABLE_LOGGING='true' }
  }
  default { Write-Error "Unknown server name: $Server. Supported: GitKraken, Playwright, github, documentation, code-analysis, testing, ci-cd, monitoring" }
}
