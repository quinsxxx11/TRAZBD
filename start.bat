@echo off
chcp 65001 >nul
title Локальный сервер - Оффлайн-трекер
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден в системе!
    echo Установите Python 3: https://www.python.org/downloads/
    pause
    exit /b
)

start "" cmd /c "timeout /t 1 >nul && start http://localhost:8000"

python server.py

pause