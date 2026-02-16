@echo off
echo ========================================
echo Deploy Backend to Render
echo ========================================
echo.
echo This will push your backend code to Render
echo.

cd /d "%~dp0"

echo Step 1: Checking git status...
git status

echo.
echo Step 2: Adding changes...
git add routes/fees.js

echo.
echo Step 3: Committing changes...
git commit -m "Add public fees endpoint for mobile app - no auth required"

echo.
echo Step 4: Pushing to Render...
git push origin main

echo.
echo ========================================
echo Deployment Initiated!
echo ========================================
echo.
echo Render will now deploy your backend.
echo This takes 2-5 minutes.
echo.
echo Check deployment status at:
echo https://dashboard.render.com
echo.
echo After deployment completes, test with:
echo curl http://localhost:5000/api/fees/public
echo.
pause
