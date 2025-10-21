<#
Interactive helper for non-coders to prepare and push the current branch, move private keys out of the repo, update .gitignore, and create a PR via GH CLI.

Usage (PowerShell):
  cd C:\Project\Bell24h
  .\scripts\auto_publish.ps1

The script is intentionally conservative: it will ask before moving files, creating a repo, pushing, or opening a PR.
#>

Param()

function Confirm-Or-Exit($msg) {
    $yn = Read-Host "$msg (y/n)"
    if ($yn -ne 'y' -and $yn -ne 'Y') {
        Write-Host "Aborted by user." -ForegroundColor Yellow
        Exit 0
    }
}

Write-Host "Auto-publish helper — will guide you through moving keys, updating .gitignore, and pushing/opening a PR." -ForegroundColor Cyan

# Load config if available
$configPath = Join-Path $PSScriptRoot 'auto_publish_config.json'
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
} else {
    $config = @{ default_remote = 'origin'; repo_owner = 'ORG'; repo_name = 'REPO'; branch = 'dev/live-e2e-stable'; gitignore_entries = @('backend/.venv/','frontend/node_modules/','keys/','ssh-*.txt') }
}

# 1) Find key-like files in the repo
Write-Host "Searching for private-key-like files and suspicious names inside repo..." -ForegroundColor Cyan
$repoRoot = Resolve-Path "..\" -Relative | ForEach-Object { (Get-Location).Path }
# We'll search for filenames that match patterns
$patterns = @('ssh*','*id_rsa*','*id_ed25519*','*.pem','*.key','*oracle*','*private*')
$found = @()
foreach ($p in $patterns) {
    $found += Get-ChildItem -Path $PSScriptRoot -Recurse -Force -Include $p -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer }
}

if ($found.Count -eq 0) {
    Write-Host "No obvious key-like files found inside the repo." -ForegroundColor Green
} else {
    Write-Host "Found these candidate files:" -ForegroundColor Yellow
    $i = 1
    foreach ($f in $found) { Write-Host "[$i] $($f.FullName)"; $i++ }
    Confirm-Or-Exit "Move these files to your user keys folder (recommended) now?"

    $userKeys = Join-Path $env:USERPROFILE 'keys'
    if (-not (Test-Path $userKeys)) { New-Item -ItemType Directory -Path $userKeys | Out-Null; Write-Host "Created $userKeys" }

    foreach ($f in $found) {
        $dest = Join-Path $userKeys $f.Name
        Write-Host "Moving $($f.FullName) -> $dest"
        try { Move-Item -Path $f.FullName -Destination $dest -Force; Write-Host "Moved" -ForegroundColor Green }
        catch { Write-Host "Could not move $($f.FullName): $_" -ForegroundColor Red }
    }
}

# 2) Ensure .gitignore contains recommended entries
Write-Host "Ensuring .gitignore contains recommended entries..." -ForegroundColor Cyan
$gitignorePath = Join-Path $PSScriptRoot '..\.gitignore' | Resolve-Path -ErrorAction SilentlyContinue
if (-not $gitignorePath) { $gitignorePath = Join-Path $PSScriptRoot '..\.gitignore' }

$desired = $config.gitignore_entries
if (-not (Test-Path $gitignorePath)) { Set-Content -Path $gitignorePath -Value '' -Encoding UTF8 }

$current = Get-Content -Path $gitignorePath -ErrorAction SilentlyContinue
foreach ($entry in $desired) {
    if ($current -notcontains $entry) { Add-Content -Path $gitignorePath -Value $entry }
}

Write-Host ".gitignore updated with recommended entries." -ForegroundColor Green

# 3) Ask to run common git cleanup (untrack large folders)
Confirm-Or-Exit "Run 'git rm -r --cached' on common large folders (backend/.venv, frontend/node_modules)?"
Push-Location $PSScriptRoot\.. 
try {
    if (Test-Path "backend/.venv") { git rm -r --cached backend/.venv | Out-Null }
    if (Test-Path "frontend/node_modules") { git rm -r --cached frontend/node_modules | Out-Null }
    git add .gitignore
    git commit -m "chore: ignore local envs and private keys" -q 2>$null
} catch { Write-Host "git cleanup skipped or not available: $_" -ForegroundColor Yellow }
Pop-Location

# 4) Show current branch and remote
Push-Location $PSScriptRoot\..
try { $branch = git rev-parse --abbrev-ref HEAD } catch { $branch = $null }
if (-not $branch) { $branch = $config.branch }
Write-Host "Current branch: $branch"

$remote = git remote get-url $config.default_remote 2>$null
if ($remote) { Write-Host "Remote '$($config.default_remote)' -> $remote" } else { Write-Host "No remote named '$($config.default_remote)' found." }

# 5) Optionally create repo with gh (interactive)
if (-not $remote) {
    $doCreate = Read-Host "No remote found. Create a GitHub repo under your account and push (requires 'gh' CLI logged in)? (y/n)"
    if ($doCreate -eq 'y' -or $doCreate -eq 'Y') {
        $repoName = Read-Host "Repository name to create (default: $($config.repo_name))"
        if (-not $repoName) { $repoName = $config.repo_name }
        Write-Host "Creating repo '$repoName' under your account (public). This will push the current directory." -ForegroundColor Cyan
        gh repo create $repoName --public --source=. --remote=$($config.default_remote) --push
        $remote = git remote get-url $config.default_remote 2>$null
        Write-Host "Created and set remote: $remote"
    }
}

# 6) Push branch
if ($remote) {
    $doPush = Read-Host "Push current branch '$branch' to '$($config.default_remote)' now? (y/n)"
    if ($doPush -eq 'y' -or $doPush -eq 'Y') {
        Write-Host "Pushing branch..."
        git push -u $config.default_remote $branch
        if ($LASTEXITCODE -eq 0) { Write-Host "Push succeeded." -ForegroundColor Green }
        else { Write-Host "Push failed. Check remote URL and credentials." -ForegroundColor Red }
    }
}

# 7) Open PR using gh if available
try {
    gh --version | Out-Null
    $doPr = Read-Host "Create a pull request from '$branch' into 'main' using gh? (y/n)"
    if ($doPr -eq 'y' -or $doPr -eq 'Y') {
        $title = Read-Host "PR title (default: Stabilize live E2E with same-origin dev server)"
        if (-not $title) { $title = 'Stabilize live E2E with same-origin dev server' }
        $bodyFile = Join-Path $PSScriptRoot '..\pr-body.md'
        if (-not (Test-Path $bodyFile)) { Set-Content -Path $bodyFile -Value "$title`n`nAuto-generated PR by scripts/auto_publish.ps1" -Encoding UTF8 }
        gh pr create --base main --head $branch --title "$title" --body-file $bodyFile
    }
} catch {
    Write-Host "GitHub CLI ('gh') not available or not configured; skipping PR creation." -ForegroundColor Yellow
}

Write-Host "Done. Review the output above for any errors. If you need help adding an SSH key to your GitHub account, open https://github.com/settings/keys and paste the public key from your user keys folder." -ForegroundColor Cyan
Pop-Location
