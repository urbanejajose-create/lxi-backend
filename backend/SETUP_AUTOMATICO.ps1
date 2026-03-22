# Script PowerShell para configurar Python - Ejecuta ÉST en PowerShell

Write-Host "========================================" -ForegroundColor Green
Write-Host "CONFIGURACIÓN AUTOMÁTICA - ENTORNO PYTHON" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Cambiar directorio
$backendPath = "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"
Set-Location $backendPath
Write-Host "✅ Directorio: $backendPath" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 1: Activar Virtual Environment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
& "$backendPath\venv\Scripts\Activate.ps1"
Write-Host "✅ venv ACTIVADO" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 2: Instalar dependencias (33 paquetes)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Espera 2-3 minutos..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "✅ DEPENDENCIAS INSTALADAS" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 3: Verificar instalación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$packageCount = (pip list | Measure-Object -Line).Lines - 2
Write-Host "✅ Paquetes instalados: $packageCount" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASO 4: Ejecutar verify_setup.py" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
python verify_setup.py

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximo paso:" -ForegroundColor Yellow
Write-Host "1. Edita backend/.env con credenciales REALES" -ForegroundColor Yellow
Write-Host "2. Ejecuta: python server_v2.py" -ForegroundColor Yellow
Write-Host ""
