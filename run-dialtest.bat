@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo    UI 日常拨测 - 启动
echo    时间: %date% %time%
echo ============================================

:: 运行拨测（失败也继续，不中断）
call npx.cmd playwright test --reporter=list,html 2>&1

:: 记录结果
set RESULT=%ERRORLEVEL%
echo.
echo ============================================
if %RESULT% EQU 0 (
    echo    ✅ 拨测全部通过
) else (
    echo    ❌ 拨测存在失败，错误码: %RESULT%
)
echo    完成时间: %date% %time%
echo ============================================

:: 保留输出以便调试
pause
exit /b %RESULT%
