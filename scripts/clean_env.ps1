Write-Host "Cleaning environment..."
Remove-Item -Path *.ps1, *.tmp -ErrorAction SilentlyContinue
Remove-Item -Path ./dev_temp -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleanup complete."
