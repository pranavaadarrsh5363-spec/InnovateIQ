@echo off
echo ========================================================
echo   Starting InnovateAI Full-Stack Platform (SIH 2024)
echo ========================================================
echo.
echo Launching Backend server on port 5000...
start "InnovateAI Backend" cmd /c "cd /d %~dp0backend && npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo Launching Frontend server on port 5173...
start "InnovateAI Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo Application will be available at:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000/api/health
echo.
echo Demo Accounts:
echo   Student: aarav@sih.dev / demo123
echo   Mentor:  mentor@sih.dev / demo123
echo   Admin:   admin@sih.dev / demo123
echo.
pause
