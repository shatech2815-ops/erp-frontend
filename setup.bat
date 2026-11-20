@echo off
echo ==========================================
echo HR CRM Dashboard - React Router Setup
echo ==========================================
echo.

cd /d "%~dp0"

echo Installing dependencies...
call npm install

echo.
echo Setup complete!
echo.
echo To start the development server, run:
echo    npm run dev
echo.
echo For more information, check REACT-ROUTER-GUIDE.md
echo.
pause
