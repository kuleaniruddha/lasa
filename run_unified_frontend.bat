@echo off
title LASA Unified Clinical Frontend
echo =========================================================================
echo   LASA-GUARD Clinical Decision Support Platform - React + Vite Frontend
echo   Clinical Portal UI - Multi-Engine AI Medication Safety System
echo =========================================================================
cd /d "%~dp0frontend"

if exist "%LOCALAPPDATA%\nodejs" (
    set "PATH=%LOCALAPPDATA%\nodejs;%PATH%"
)
if exist "C:\Program Files\nodejs" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] 'npm' was not found in your system PATH.
    echo Please ensure Node.js is installed from https://nodejs.org
    echo Or run npm via your Node installation folder.
    echo.
)

if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies (First run only)...
    call npm install
)

echo [INFO] Starting Vite Development Server on http://localhost:5173 ...
call npm run dev
pause
