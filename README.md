# 📊 台美股看盤系統

一個簡單的看盤系統，可以看台股、美股、熱力圖、新聞和當日建議。

## 功能

- ✅ 台股熱力圖（加權指數、華通、敬鵬、金寶、昇達科、台積電等）
- ✅ 美股熱力圖（S&P 500、Nasdaq、Dow Jones、費半、NVDA、TSLA等）
- ✅ 個股走勢圖（K線圖）
- ✅ 當日操作建議（根據美股表現）
- ✅ 最新財經新聞
- ✅ 手機和電腦都能用

## 啟動方式

```bash
cd /home/openclaw/.openclaw/workspace/stock-dashboard
./start.sh
```

## 訪問方式

| 設備 | 網址 |
|------|------|
| 電腦 | http://localhost:3000 |
| 手機（同一網路）| http://172.23.176.129:3000 |

## 添加新股票

編輯 `server.js` 中的 `STOCKS` 物件：

```javascript
const STOCKS = {
  tw: {
    '加權指數': '^TWII',
    '華通': '2313.TW',
    // 在這裡添加新股票
  },
  us: {
    'S&P 500': '^GSPC',
    // 在這裡添加新股票
  }
};
```

## 更新熱力圖分類

編輯 `server.js` 中的 `getHeatmapData` 函數。

## 已知限制

1. 數據來自 Yahoo Finance，有延遲
2. 新聞來源有限，可能載入失敗
3. 建議僅供參考，不構成投資建議

## 技術架構

- **後端**: Node.js + Express
- **前端**: HTML5 + CSS3 + Chart.js
- **數據**: Yahoo Finance API
- **無需資料庫**: 純串聯外部API
