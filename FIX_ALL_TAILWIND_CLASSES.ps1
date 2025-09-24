# PowerShell script to fix all Tailwind CSS issues
Write-Host "🔧 Fixing Tailwind CSS Classes..." -ForegroundColor Green

# Navigate to client directory
Set-Location "C:\Users\Sanika\Projects\bell24h\client"

# Get all TypeScript/JavaScript files
$files = Get-ChildItem -Recurse -Include "*.tsx", "*.ts", "*.js", "*.jsx"

Write-Host "📁 Found $($files.Count) files to process" -ForegroundColor Yellow

# Fix invalid Tailwind classes
$replacements = @{
    "from-indigo-600" = "from-blue-600"
    "to-indigo-600" = "to-blue-600"
    "bg-indigo-600" = "bg-blue-600"
    "text-indigo-600" = "text-blue-600"
    "border-indigo-600" = "border-blue-600"
    "hover:bg-indigo-600" = "hover:bg-blue-600"
    "focus:ring-indigo-600" = "focus:ring-blue-600"
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($search in $replacements.Keys) {
        $replace = $replacements[$search]
        $content = $content -replace $search, $replace
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✅ Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "🎉 All Tailwind classes fixed!" -ForegroundColor Green
