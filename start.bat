@echo off
echo Starting Sport Analytics Platform...

echo Installing backend dependencies...
cd server
call npm install

echo Starting backend server...
start "Backend" cmd /k "npm run dev"

echo Starting frontend...
cd ..
start "Frontend" cmd /k "npm start"

echo Both servers are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001