@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"
title nuricut kids preview
echo.
echo  Starting nuricut kids preview...
echo  Your browser will open automatically: /ko/kids/
echo.
echo  * Keep this window open while you use the site.
echo  * Close this window to stop the preview.
echo.
call npm run dev -- --open /ko/kids/
echo.
echo  Preview stopped. If you see an error above, show it to Claude.
pause
