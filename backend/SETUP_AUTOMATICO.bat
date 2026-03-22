@echo off
REM Script para configurar completo el entorno Python
REM Simplemente ejecuta este archivo (.bat)

cd /d "C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend"

echo ====================================================
echo PASO 1: Activar Virtual Environment
echo ====================================================
call venv\Scripts\activate.bat

echo.
echo ====================================================
echo PASO 2: Instalar todas las dependencias
echo ====================================================
pip install -r requirements.txt

echo.
echo ====================================================
echo PASO 3: Verificar instalacion
echo ====================================================
pip list

echo.
echo ====================================================
echo PASO 4: Ejecutar verificacion de setup
echo ====================================================
python verify_setup.py

echo.
echo ====================================================
echo COMPLETADO!
echo ====================================================
pause
