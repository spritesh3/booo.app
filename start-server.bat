@echo off
title Boo - Local Server :3000
echo.
echo   Starting server on http://localhost:3000
echo   Press Ctrl+C here to stop.
echo.
python -m http.server 3000
pause
