@echo off
setlocal EnableExtensions
for /f "tokens=2 delims=:" %%A in ('chcp') do set "_OLDCP=%%A"
set "_OLDCP=%_OLDCP: =%"
chcp 65001 >nul
set "_EXITCODE=0"
echo.
echo ========================================
echo   恢复原始 UI (App.old.tsx)
echo ========================================
echo.

cd /d "%~dp0"

if not exist "src\App.old.tsx" (
    echo [错误] 找不到备份文件 App.old.tsx
    echo [提示] 可能从未切换过，或备份文件已被删除
    set "_EXITCODE=1"
    goto :end
)

echo [恢复] App.old.tsx -^> App.tsx
copy "src\App.old.tsx" "src\App.tsx" >nul

echo.
echo ========================================
echo   恢复完成！
echo ========================================
echo.
echo 下一步:
echo   1. 运行: npm run dev
echo   2. 访问: http://localhost:5173
echo.
echo 再次切换到新 UI: switch-to-new-ui.bat
echo.
:end
echo 请按任意键继续. . .
pause >nul
if defined _OLDCP chcp %_OLDCP% >nul
exit /b %_EXITCODE%
