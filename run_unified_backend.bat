@echo off
title LASA Unified Backend API
echo =========================================================================
echo   LASA Unified AI Healthcare Safety Portal - Flask Backend
echo   Serving FDA POCA, ML Ensembles, BDA Stream Engine, and Clinical APIs
echo =========================================================================
cd /d "%~dp0"
set PYTHONPATH=%cd%
set PORT=5000
set FLASK_ENV=development

where python >nul 2>nul
if %errorlevel% equ 0 (
    python -m backend.app
) else (
    echo [INFO] Using WindowsApps Python...
    "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" -m backend.app
)
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend terminated with an error.
)
pause
