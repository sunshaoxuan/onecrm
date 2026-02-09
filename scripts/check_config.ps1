Write-Host "Verifying configuration..."
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found"
    exit 1
}
if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules not found, running npm install..."
    npm install
}
Write-Host "Configuration verified."
