@echo off
setlocal EnableExtensions
for /f "tokens=2 delims=:" %%A in ('chcp') do set "_OLDCP=%%A"
set "_OLDCP=%_OLDCP: =%"
chcp 65001 >nul
set "_EXITCODE=0"
echo.
echo ========================================
echo   切换到新 UI (App.new.tsx)
echo ========================================
echo.

cd /d "%~dp0"

if not exist "src\App.new.tsx" (
    echo [错误] App.new.tsx 不存在
    set "_EXITCODE=1"
    goto :end
)

if not exist "src\App.old.tsx" (
    echo [备份] App.tsx -^> App.old.tsx
    copy "src\App.tsx" "src\App.old.tsx" >nul
) else (
    echo [信息] 已存在备份文件 App.old.tsx
)

echo [应用] App.new.tsx -^> App.tsx
copy "src\App.new.tsx" "src\App.tsx" >nul

echo.
echo ========================================
echo   切换完成！
echo ========================================
echo.
echo 下一步:
echo   1. 确保已配置 .env.local 文件
echo   2. 运行: npm run dev
echo   3. 访问: http://localhost:5173
echo.
echo 恢复原版本: restore-original-ui.bat
echo.
:end
echo 请按任意键继续. . .
pause >nul
if defined _OLDCP chcp %_OLDCP% >nul
exit /b %_EXITCODE%
