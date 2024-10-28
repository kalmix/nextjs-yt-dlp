@echo off
echo Starting server...
start cmd /k "node ./server/app.js"

echo Starting development environment...
start cmd /k "npm run dev"

pause
