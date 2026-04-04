@echo off
setlocal

set "ROOT_DIR=%~dp0"

if not exist "%ROOT_DIR%node_modules" (
  echo [INFO] Instalando dependencias frontend...
  npm install
)

set PORT=3000
npm start

endlocal
