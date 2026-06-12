@echo off
chcp 65001 >nul
echo 建立桌面捷徑中...

powershell.exe -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\台美股看盤系統.lnk'); $s.TargetPath = 'http://172.23.176.129:3000'; $s.Description = '台美股看盤系統'; $s.Save()"

echo 完成！捷徑已建立於桌面。
pause
