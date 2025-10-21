<# Start all MCP servers in parallel (each opens a new process window)
Usage: .\scripts\mcp-start-all.ps1
#>

$servers = @('documentation','playwright','code-analysis','testing','monitoring')
foreach ($s in $servers) {
  $cmd = "./scripts/mcp-start.ps1 -Server $s"
  Start-Process -FilePath pwsh -ArgumentList '-NoProfile','-NoExit','-Command',$cmd
}
