# AgentForge MD Standalone PowerShell Launcher
$ErrorActionPreference = "Stop"

# Get current script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host "         AgentForge MD - Standalone Launcher           " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Yellow
Write-Host ""

# 1. Check for Node.js
try {
    $nodeVer = node -v
    Write-Host "[INFO] Node.js version detected: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/ to run AgentForge." -ForegroundColor Yellow
    Read-Host "Press Enter to exit..."
    Exit 1
}

# 2. Check and create shortcut in folder if it doesn't exist
$shortcutPath = Join-Path $ScriptDir "Launch AgentForge.lnk"
if (-not (Test-Path $shortcutPath)) {
    Write-Host "[INFO] Creating folder shortcut: Launch AgentForge.lnk..." -ForegroundColor Cyan
    try {
        $wshell = New-Object -ComObject WScript.Shell
        $shortcut = $wshell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = Join-Path $ScriptDir "run.bat"
        $shortcut.WorkingDirectory = $ScriptDir
        $shortcut.Description = "Launch AgentForge MD Editor and Server"
        $shortcut.IconLocation = "$ScriptDir\client\public\icon-512.jpg"
        $shortcut.Save()
        Write-Host "[SUCCESS] Shortcut created successfully!" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Could not create shortcut automatically." -ForegroundColor Yellow
    }
    Write-Host ""
}

# 3. Determine package manager (pnpm or npm)
$pm = "npm"
try {
    pnpm -v > $null
    $pm = "pnpm"
} catch {}
Write-Host "[INFO] Using package manager: $pm" -ForegroundColor Cyan

# 4. Install dependencies if node_modules is missing
$nodeModulesPath = Join-Path $ScriptDir "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "[INFO] node_modules not found. Installing dependencies using $pm..." -ForegroundColor Cyan
    Set-Location $ScriptDir
    if ($pm -eq "pnpm") {
        pnpm install
    } else {
        npm install
    }
    Write-Host "[SUCCESS] Dependencies installed!" -ForegroundColor Green
    Write-Host ""
}

# 5. Build project if dist is missing
$distPath = Join-Path $ScriptDir "dist"
if (-not (Test-Path $distPath)) {
    Write-Host "[INFO] Build folder (dist) not found. Building the application..." -ForegroundColor Cyan
    Set-Location $ScriptDir
    if ($pm -eq "pnpm") {
        pnpm build
    } else {
        npm run build
    }
    Write-Host "[SUCCESS] Application built!" -ForegroundColor Green
    Write-Host ""
}

# 6. Launch Server in a separate window
Write-Host "[INFO] Starting AgentForge Server..." -ForegroundColor Cyan
# Set CMD window title first, then change directory, set production environment, and start Node server.
$serverCommand = "title AgentForge Server && cd /d `"$ScriptDir`" && set NODE_ENV=production&& node dist/index.js"
Start-Process cmd -ArgumentList "/k `"$serverCommand`""

Write-Host ""
Write-Host "[SUCCESS] AgentForge MD is running!" -ForegroundColor Green
Write-Host "A separate console window has been opened to run the server." -ForegroundColor Yellow
Write-Host "It will automatically launch your default browser shortly." -ForegroundColor Yellow
Write-Host "This launcher will auto-close in 3 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 3
