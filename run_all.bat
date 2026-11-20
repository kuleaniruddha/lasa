@echo off
title LASA Unified Launcher
echo =========================================================================
echo   Starting LASA Unified AI Clinical Safety Portal (Full Stack)
echo =========================================================================
cd /d "%~dp0"

echo [1/2] Launching Backend Flask API on port 5000...
start "LASA Backend API (Port 5000)" cmd /k "run_unified_backend.bat"

echo [2/2] Launching Frontend Clinical UI on port 5173...
start "LASA Frontend Portal (Port 5173)" cmd /k "run_unified_frontend.bat"

echo.
echo =========================================================================
echo   LASA Unified Portal is starting up!
echo   - Backend API Status:  http://localhost:5000/health
echo   - Frontend Portal UI:  http://localhost:5173
echo =========================================================================
echo Check the two opened terminal windows for real-time logs.
echo.
pause
