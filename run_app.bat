@echo off
title LASA-SAFE - AI-Powered LASA Medication Error Prevention System
echo =========================================================================
echo  LASA-SAFE - AI-Powered Medication Error Prevention System
echo  Honours AIML Healthcare Project - AY 2026-27
echo =========================================================================
echo.
echo Setting execution paths...
set "PATH=C:\Program Files\nodejs;%PATH%"

cd /d "%~dp0frontend"
echo Starting LASA-SAFE Clinical Decision Support Web Application...
start http://localhost:5173
call npx vite --host 0.0.0.0 --port 5173
pause
