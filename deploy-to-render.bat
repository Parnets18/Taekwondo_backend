@echo off
echo ========================================
echo   Deploy Backend to Render.com
echo ========================================
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Fix certificate statistics endpoint - add examiner field

git commit -m "%commit_msg%"
echo.

echo Step 4: Pushing to remote...
git push origin main
echo.

echo ========================================
echo   Deployment Initiated!
echo ========================================
echo.
echo Render will now auto-deploy your changes.
echo This usually takes 2-5 minutes.
echo.
echo Next Steps:
echo 1. Go to https://dashboard.render.com
echo 2. Check deployment status
echo 3. View logs for any errors
echo.
echo After deployment completes, test with:
echo   node test-live-endpoint.js
echo.
echo Or test in browser:
echo   https://taekwon-frontend.onrender.com/api/certificates/statistics
echo.
pause
