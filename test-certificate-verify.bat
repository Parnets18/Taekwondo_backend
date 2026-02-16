@echo off
echo Testing Certificate Verification Endpoint...
echo.
echo Sending POST request to https://taekwon-frontend.onrender.com/api/certificates/verify
echo.

curl -X POST https://taekwon-frontend.onrender.com/api/certificates/verify ^
  -H "Content-Type: application/json" ^
  -d "{\"verificationCode\": \"CERT-2026-00123\"}"

echo.
echo.
echo If you see a 404 error, the backend server needs to be restarted!
echo.
pause
