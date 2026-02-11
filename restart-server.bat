@echo off
echo Restarting Taekwondo Backend Server...
echo.
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting server...
start cmd /k "cd /d %~dp0 && node server.js"
echo.
echo Server restart initiated!
echo Check the new window for server output.
pause
