@echo off
start "LXI Backend" cmd /k "cd /d C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\backend && python server_v2.py"
start "LXI Frontend" cmd /k "cd /d C:\Users\admin\OneDrive\Escritorio\WEB - LXI\backup_app_core\frontend && set PORT=3001 && npm start"
