@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
title nuricut.video preview
echo.
echo  Starting nuricut.video preview...
echo  Your browser will open automatically: http://localhost:5173
echo.
echo  * Keep this window open while you use the site.
echo  * Close this window to stop the preview.
echo.
call npm run dev -- --open
echo.
echo  Preview stopped. If you see an error above, show it to Claude.
pause
