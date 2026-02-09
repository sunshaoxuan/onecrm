$ErrorActionPreference = "Stop"

$composeFile = Join-Path $PSScriptRoot "..\infra\minio\docker-compose.yml"

Write-Host "Starting OneCRM dedicated MinIO stack..."
docker compose -f $composeFile up -d

Write-Host "Waiting for service readiness..."
docker compose -f $composeFile ps

Write-Host ""
Write-Host "MinIO API:     http://localhost:19200"
Write-Host "MinIO Console: http://localhost:19201"
Write-Host "Access Key:    onecrm_admin"
Write-Host "Secret Key:    onecrm_admin_2026"
Write-Host "Bucket:        onecrm-backend"

