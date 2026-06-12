#!/bin/bash
# 啟動看盤系統

cd /home/openclaw/.openclaw/workspace/stock-dashboard

# 檢查是否已運行
if pgrep -f "node server.js" > /dev/null; then
  echo "系統已在運行中"
  echo "訪問: http://localhost:3000"
else
  echo "啟動看盤系統..."
  nohup node server.js > /dev/null 2>&1 &
  echo "系統已啟動!"
  echo ""
  echo "📱 電腦訪問: http://localhost:3000"
  echo "📱 手機訪問: http://172.23.176.129:3000"
fi
