@echo off
REM ============================================================
REM Деплой серверных файлов «Идеальной тетради» на PocketBase
REM ============================================================
REM 
REM Этот скрипт копирует хуки и миграции на VPS и перезапускает PocketBase.
REM 
REM Перед запуском:
REM   1. Убедитесь, что SSH-доступ настроен (ключ или пароль)
REM   2. Замените SERVER_IP на IP вашего VPS
REM   3. Проверьте путь PB_PATH (где установлен PocketBase)
REM ============================================================

set SERVER_IP=ВАШ_IP_СЕРВЕРА
set SERVER_USER=root
set PB_PATH=/opt/pocketbase

echo.
echo === Деплой «Идеальная тетрадь» на %SERVER_USER%@%SERVER_IP% ===
echo.

echo [1/3] Копирую хуки...
scp pb_hooks\write.pb.js %SERVER_USER%@%SERVER_IP%:%PB_PATH%/pb_hooks/

echo [2/3] Копирую миграции...
scp pb_migrations\add_write_fields.js %SERVER_USER%@%SERVER_IP%:%PB_PATH%/pb_migrations/

echo [3/3] Перезапускаю PocketBase...
ssh %SERVER_USER%@%SERVER_IP% "systemctl restart pocketbase"

echo.
echo === Готово! ===
echo Проверьте: https://api.tochilka.app/_/
echo.
pause
