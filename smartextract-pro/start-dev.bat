@echo off
echo Starting SmartExtract Pro Development Environment...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "python -m uvicorn app.main:app --host localhost --port 8000 --reload"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo Development servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this script...
pause > nul
