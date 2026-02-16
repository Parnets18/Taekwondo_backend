@echo off
echo Testing Certificate Verification Endpoint...
echo.
echo Sending POST request to http://localhost:5000/api/certificates/verify
echo.

curl -X POST http://localhost:5000/api/certificates/verify ^
  -H "Content-Type: application/json" ^
  -d "{\"verificationCode\": \"CERT-2026-00123\"}"

echo.
echo.
echo If you see a 404 error, the backend server needs to be restarted!
echo.
pause
