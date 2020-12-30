@echo off
echo Paste mongod.exe filepath here please. (Drag and drop exe file on console should paste the path here)
echo.
set /p mongodpath=

start %mongodpath% --dbpath "%~dp0\database"

nodemon readit