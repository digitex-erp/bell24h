# Bell24H Essential Extensions Installer
# Run this script to install all necessary extensions for the Bell24H project

Write-Host "🚀 Installing Bell24H Essential Extensions..." -ForegroundColor Green

# Core Development Extensions
Write-Host "📦 Installing Core Development Extensions..." -ForegroundColor Cyan
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension formulahendry.auto-rename-tag
code --install-extension ms-vscode.vscode-typescript-next

# Testing & Quality Assurance
Write-Host "🧪 Installing Testing Extensions..." -ForegroundColor Cyan
code --install-extension orta.vscode-jest
code --install-extension ms-playwright.playwright
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# Database & ORM Support
Write-Host "🗄️ Installing Database Extensions..." -ForegroundColor Cyan
code --install-extension prisma.prisma
code --install-extension qwtel.sqlite-viewer

# API Development
Write-Host "🔌 Installing API Development Extensions..." -ForegroundColor Cyan
code --install-extension humao.rest-client
code --install-extension rangav.vscode-thunder-client

# Git & Version Control
Write-Host "📚 Installing Git Extensions..." -ForegroundColor Cyan
code --install-extension eamodio.gitlens
code --install-extension mhutchie.git-graph

# Productivity Boosters
Write-Host "⚡ Installing Productivity Extensions..." -ForegroundColor Cyan
code --install-extension christian-kohler.path-intellisense
code --install-extension oderwat.indent-rainbow
code --install-extension ms-vscode.vscode-json

# Project-Specific Extensions
Write-Host "🎯 Installing Project-Specific Extensions..." -ForegroundColor Cyan
code --install-extension ms-vscode.vscode-python
code --install-extension ms-vscode.vscode-yaml
code --install-extension yzhang.markdown-all-in-one
code --install-extension mechatroner.rainbow-csv

Write-Host "✅ All Bell24H extensions installed successfully!" -ForegroundColor Green
Write-Host "🔄 Please restart Cursor to ensure all extensions are properly loaded." -ForegroundColor Yellow 