@echo off
cd /d "%~dp0"
title nuricut.video - upload to GitHub
echo.
echo  Uploading nuricut.video to GitHub...
echo  If a GitHub login window appears, choose "Sign in with your browser" and approve.
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
if errorlevel 1 (echo  [FAILED] Show this window to Claude.) else (echo  [DONE] Upload finished. You can close this window.)
pause
