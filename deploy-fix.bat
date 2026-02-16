@echo off
echo ========================================
echo DEPLOYING CERTIFICATE FIX TO RENDER.COM
echo ========================================

echo.
echo [1/3] Adding changes to git...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "URGENT FIX: Certificate statistics endpoint - fixes admin dashboard crash"

echo.
echo [3/3] Pushing to repository...
git push origin main

echo.
echo ========================================
echo DEPLOYMENT INITIATED!
echo ========================================
echo.
echo Render.com will now automatically deploy your changes.
echo This usually takes 2-5 minutes.
echo.
echo Check deployment status at:
echo https://dashboard.render.com
echo.
echo After deployment, test the fix:
echo curl https://taekwon-frontend.onrender.com/api/certificates/statistics
echo.
echo The admin dashboard should now work without crashes!
echo.
pause