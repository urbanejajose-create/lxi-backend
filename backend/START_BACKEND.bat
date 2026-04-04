@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "VENV_PY=%ROOT_DIR%venv\Scripts\python.exe"

if not exist "%VENV_PY%" (
  echo [INFO] No se encontro venv. Creando entorno virtual...
  (py -3 -m venv venv || python -m venv venv)
  if exist "%VENV_PY%" (
    echo [INFO] Instalando dependencias backend...
    "%VENV_PY%" -m pip install --upgrade pip
    "%VENV_PY%" -m pip install -r requirements.txt
  ) else (
    echo [ERROR] No se pudo crear el venv.
    echo Asegura que Python este instalado y en PATH.
    pause
    exit /b 1
  )
)

"%VENV_PY%" server_v2.py

endlocal
