# 📊 AI Stock Dashboard Pro

> 專業股票看盤系統 - K線圖 | 技術分析 | 產業熱力圖 | 價格警示

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Mac%20%7C%20Linux-lightgrey.svg)

---

## 🎯 功能特色

### 📈 專業技術分析
- **K線圖（蠟燭圖）** - 清楚顯示 OHLC 價格結構
- **MA 均線** - MA5、MA20、MA60 疊加顯示
- **技術指標** - RSI、KD、MACD 完整計算
- **支撐/壓力位** - 自動計算 R1、R2、R3、S1、S2、S3
- **信號強度** - 視覺化買賣信號強度

### 🗺️ 產業熱力圖
- 一眼看出強弱勢族群
- 區塊大小 = 市值權重
- 顏色 = 漲跌幅度

### 📊 股票篩選器
- 按產業篩選（半導體、PCB、航運、金融等）
- 按 RSI 篩選（超賣、中性、超買）
- 按趨勢篩選（上升、下降）

### ⚖️ 個股比較
- 同時比較 2 檔股票
- P/E、EPS、營收、基本面
- 技術指標並排

### 🔔 價格警示
- 自訂價格條件
- 達到目標時通知

### 📱 手機友善
- 響應式設計
- 手機、平板、電腦都能用

---

## 🚀 快速開始

### 方法 1：直接使用
1. 開啟示範網址
2. 輸入密碼（請向管理員取得）
3. 開始使用！

### 方法 2：本地部署

```bash
# Clone 專案
git clone https://github.com/Rockychen530-maker/stock-dashboard.git
cd stock-dashboard

# 安裝依賴
npm install

# 啟動伺服器
node server.js

# 開啟瀏覽器
# http://localhost:3000
```

---

## 📋 支援的股票

### 台股
- 台積電 (2330)
- 華通 (2313)
- 敬鵬 (2355)
- 金寶 (2312)
- 昇達科 (3491)
- 聯發科 (2454)
- 鴻海 (2317)
- 以及更多...

### 美股
- NVDA
- TSLA
- AAPL
- MSFT
- GOOGL
- 以及更多...

---

## 💰 方案選擇

| 方案 | 價格 | 功能 |
|------|------|------|
| 免費版 | $0 | 基本報價 + 基礎指標 |
| 專業版 | $1,500/月 | K線圖 + 完整技術分析 + 警示 |
| 企業版 | $5,000/月起 | 私有部署 + API + 技術支援 |

---

## 🔧 技術棧

- **前端**：HTML5 + CSS3 + JavaScript
- **圖表**：Chart.js + chartjs-chart-financial
- **後端**：Node.js + Express
- **資料來源**：Yahoo Finance API
- **部署**：Vercel / Heroku / AWS

---

## 📞 聯絡方式

- **Discord**：rocky_9636
- **GitHub Issues**：https://github.com/Rockychen530-maker/stock-dashboard/issues

---

## 📄 授權

MIT License - 可以自由使用、修改、散布

---

## 🔄 更新日誌

### v3.0 (2026-06-13)
- 新增：K線圖（蠟燭圖）
- 新增：MA5/20/60 均線疊加
- 新增：成交量柱子
- 新增：多時間範圍（1D-ALL）
- 新增：股票篩選器
- 新增：信號強度視覺化
- 新增：快速指數欄
- 效能優化：快取機制 + 並行請求

### v2.0 (2026-06-11)
- 新增：產業熱力圖
- 新增：新聞區

### v1.0 (2026-06-10)
- 初始版本
- 基本報價功能

---

**如果覺得好用，請給我一顆 ⭐！**
