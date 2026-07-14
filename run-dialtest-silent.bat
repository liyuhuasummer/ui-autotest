@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: 写入拨测日志
set LOGFILE=dialtest-log.txt
echo [%date% %time%] 开始拨测 >> %LOGFILE%

:: 执行拨测
call npx.cmd playwright test --reporter=list 2>&1 >> %LOGFILE%

if %ERRORLEVEL% EQU 0 (
    echo [%date% %time%] 全部通过 >> %LOGFILE%
) else (
    echo [%date% %time%] 存在失败！ >> %LOGFILE%

    :: 发送邮件告警（通过 Node.js 脚本）
    node -e "require('./utils/mailer').sendAlert({subject:'拨测失败',summary:'详见日志',failures:[]})" 2>&1 >> %LOGFILE%
)

echo [%date% %time%] 拨测完成 >> %LOGFILE%
