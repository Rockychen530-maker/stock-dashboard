const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const PASSWORD = 'rockygogogo';

// 簡單的 session 管理（記憶體）
const sessions = new Set();

// 用戶資訊（來自對話元數據）
const USER_INFO = {
  name: '台中小陳',
  username: 'rocky_9636',
  chatId: 'user:1214915131692159017'
};

// 密碼驗證 middleware
function authMiddleware(req, res, next) {
  // 跳過 API 和靜態資源檢查（密碼只用於主頁）
  if (req.path.startsWith('/api/') || req.path.startsWith('/public/')) {
    return next();
  }
  
  // 如果有有效 session cookie，直接通過
  const sessionId = req.cookies?.session_id;
  if (sessionId && sessions.has(sessionId)) {
    return next();
  }
  
  // 檢查密碼
  const inputPassword = req.query.password || req.body?.password;
  if (inputPassword === PASSWORD) {
    // 產生新 session
    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.add(sessionId);
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24小時
      sameSite: 'strict'
    });
    return next();
  }
  
  // 需要登入
  res.send(createLoginPage());
}

function createLoginPage() {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>看盤系統 - 請登入</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-box {
      background: #16213e;
      padding: 40px;
      border-radius: 20px;
      border: 2px solid #e94560;
      box-shadow: 0 10px 40px rgba(233, 69, 96, 0.3);
      width: 90%;
      max-width: 400px;
    }
    h1 { color: #e94560; text-align: center; margin-bottom: 10px; font-size: 1.5rem; }
    p { color: #a0a0b0; text-align: center; margin-bottom: 30px; font-size: 0.9rem; }
    input {
      width: 100%;
      padding: 15px;
      border-radius: 10px;
      border: 1px solid #333;
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 1rem;
      margin-bottom: 15px;
      text-align: center;
    }
    input:focus { outline: none; border-color: #e94560; }
    button {
      width: 100%;
      padding: 15px;
      border-radius: 10px;
      border: none;
      background: #e94560;
      color: #fff;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
    }
    button:hover { background: #ff6b81; }
    .error { color: #ff4757; text-align: center; margin-top: 15px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="login-box">
    <h1>🔐 看盤系統</h1>
    <p>請輸入密碼以進入</p>
    <form method="POST">
      <input type="password" name="password" placeholder="輸入密碼..." required autofocus>
      <button type="submit">登入</button>
    </form>
    <p class="error">提示：密碼由管理員提供</p>
  </div>
</body>
</html>`;
}

// 允許 CORS（讓 Vercel 可以存取）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// 需要在 express 之前加入 cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// 所有請求都需要驗證密碼（除了 API）
app.use(authMiddleware);

// 股票代碼映射
const STOCKS = {
  tw: {
    '加權指數': '^TWII',
    '華通': '2313.TW',
    '敬鵬': '2355.TW',
    '金寶': '2312.TW',
    '昇達科': '3491.TW',
    '台積電': '2330.TW',
    '聯發科': '2454.TW',
    '鴻海': '2317.TW',
  },
  us: {
    'S&P 500': '^GSPC',
    'Nasdaq': '^IXIC',
    'Dow Jones': '^DJI',
    '費城半導體': '^SOX',
    'NVDA': 'NVDA',
    'TSLA': 'TSLA',
    'AAPL': 'AAPL',
    'MSFT': 'MSFT',
  }
};

// 熱力圖股票池（按產業分組）
const TREEMAP_STOCKS = [
  { symbol: '2330.TW', name: '台積電', sector: '半導體' },
  { symbol: '2454.TW', name: '聯發科', sector: '半導體' },
  { symbol: '2313.TW', name: '華通', sector: '半導體' },
  { symbol: '2355.TW', name: '敬鵬', sector: '半導體' },
  { symbol: '6263.TW', name: '迅得', sector: '半導體' },
  { symbol: '2603.TW', name: '長榮', sector: '航運' },
  { symbol: '2607.TW', name: '陽明', sector: '航運' },
  { symbol: '2615.TW', name: '萬海', sector: '航運' },
  { symbol: '2609.TW', name: '長榮航', sector: '航運' },
  { symbol: '2409.TW', name: '友達', sector: '光電' },
  { symbol: '3481.TW', name: '群創', sector: '光電' },
  { symbol: '6116.TW', name: '彩晶', sector: '光電' },
  { symbol: '2376.TW', name: '技嘉', sector: '電腦週邊' },
  { symbol: '2395.TW', name: '微星', sector: '電腦週邊' },
  { symbol: '3491.TW', name: '昇達科', sector: '網通' },
  { symbol: '6285.TW', name: '啟碁', sector: '網通' },
  { symbol: '2317.TW', name: '鴻海', sector: '網通' },
  { symbol: '2884.TW', name: '玉山金', sector: '金融' },
  { symbol: '2891.TW', name: '中信金', sector: '金融' },
  { symbol: '2882.TW', name: '國泰金', sector: '金融' },
  { symbol: '2881.TW', name: '富邦金', sector: '金融' },
  { symbol: '1301.TW', name: '台塑', sector: '塑膠' },
  { symbol: '1304.TW', name: '台化', sector: '塑膠' },
  { symbol: '2015.TW', name: '豐興', sector: '鋼鐵' },
  { symbol: '2014.TW', name: '中鋼', sector: '鋼鐵' },
  { symbol: '3218.TW', name: '磐儀', sector: 'AI/伺服器' },
  { symbol: '3706.TW', name: '神基', sector: 'AI/伺服器' },
  { symbol: '3338.TW', name: '泰碩', sector: 'AI/伺服器' },
  { symbol: '2312.TW', name: '金寶', sector: 'PCB' },
  { symbol: '6108.TW', name: '雅佳', sector: 'PCB' },
  { symbol: '6213.TW', name: '聯茂', sector: 'PCB' },
];

// ============ 技術指標計算 ============

// 計算 RSI (Relative Strength Index)
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  
  let gains = [], losses = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  let avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return Math.round((100 - (100 / (1 + rs))) * 100) / 100;
}

// 計算 MACD
function calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
  if (prices.length < slow + signal) return null;
  
  // 計算 EMA
  function ema(data, period) {
    const k = 2 / (period + 1);
    let emaVal = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < data.length; i++) {
      emaVal = data[i] * k + emaVal * (1 - k);
    }
    return emaVal;
  }
  
  const emaFast = ema(prices, fast);
  const emaSlow = ema(prices, slow);
  const macdLine = emaFast - emaSlow;
  
  // 計算 Signal Line (EMA of MACD)
  const macdValues = [];
  for (let i = slow; i < prices.length; i++) {
    const ef = ema(prices.slice(0, i + 1), fast);
    const es = ema(prices.slice(0, i + 1), slow);
    macdValues.push(ef - es);
  }
  const signalLine = ema(macdValues, signal);
  
  return {
    macd: Math.round(macdLine * 100) / 100,
    signal: Math.round(signalLine * 100) / 100,
    histogram: Math.round((macdLine - signalLine) * 100) / 100
  };
}

// 計算 KD 指標
function calculateKD(highs, lows, closes, period = 9) {
  if (closes.length < period + 1) return null;
  
  const recentCloses = closes.slice(-period);
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  
  const highest = Math.max(...recentHighs);
  const lowest = Math.min(...recentLows);
  
  const rsv = (recentCloses[period - 1] - lowest) / (highest - lowest) * 100;
  
  return Math.round(rsv * 100) / 100;
}

// 計算移動平均線
function calculateMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return Math.round((slice.reduce((a, b) => a + b, 0) / period) * 100) / 100;
}

// 計算支撐/壓力位（Simple Pivot Points）
function calculateSupportResistance(highs, lows, closes) {
  if (closes.length < 5) return null;
  
  const last = closes.length - 1;
  const pivot = (highs[last] + lows[last] + closes[last]) / 3;
  
  const r1 = 2 * pivot - lows[last];
  const r2 = pivot + (highs[last] - lows[last]);
  const r3 = high = highs[last] + 2 * (pivot - lows[last]);
  
  const s1 = 2 * pivot - highs[last];
  const s2 = pivot - (highs[last] - lows[last]);
  const s3 = low = lows[last] - 2 * (highs[last] - pivot);
  
  return {
    pivot: Math.round(pivot * 100) / 100,
    r1: Math.round(r1 * 100) / 100,
    r2: Math.round(r2 * 100) / 100,
    r3: Math.round(r3 * 100) / 100,
    s1: Math.round(s1 * 100) / 100,
    s2: Math.round(s2 * 100) / 100,
    s3: Math.round(s3 * 100) / 100
  };
}

// ============ 取得股票報價 ============

async function getStockQuote(symbol, range = '3mo') {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    
    const data = response.data.chart.result[0];
    const meta = data.meta;
    const timestamps = data.timestamp || [];
    const quotes = data.indicators.quote[0];
    
    const prices = quotes.close.filter(c => c !== null);
    const highs = quotes.high.filter(c => c !== null);
    const lows = quotes.low.filter(c => c !== null);
    const volumes = quotes.volume.filter(c => c !== null);
    
    // 計算技術指標
    const rsi = calculateRSI(prices, 14);
    const macd = calculateMACD(prices);
    const kd = calculateKD(highs, lows, prices, 9);
    const ma5 = calculateMA(prices, 5);
    const ma20 = calculateMA(prices, 20);
    const ma60 = calculateMA(prices, 60);
    const sr = calculateSupportResistance(highs, lows, prices);
    
    return {
      symbol: meta.symbol,
      price: meta.regularMarketPrice,
      change: meta.regularMarketChange,
      changePercent: meta.regularMarketChangePercent,
      prevClose: meta.chartPreviousClose,
      volume: meta.regularMarketVolume,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      weekHigh52: meta.fiftyTwoWeekHigh,
      weekLow52: meta.fiftyTwoWeekLow,
      // 技術指標
      rsi: rsi,
      macd: macd,
      kd: kd,
      ma5: ma5,
      ma20: ma20,
      ma60: ma60,
      // 支撐/壓力
      supportResistance: sr,
      // 報價歷史
      quotes: timestamps.map((t, i) => ({
        time: new Date(t * 1000).toISOString().split('T')[0],
        open: quotes.open[i],
        high: quotes.high[i],
        low: quotes.low[i],
        close: quotes.close[i],
        volume: quotes.volume[i]
      })).filter(q => q.close !== null)
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    return null;
  }
}

// 取得基本面資料（從 Yahoo Finance）
async function getFundamentalData(symbol) {
  try {
    // 使用 Yahoo Finance Statistics API
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,financialData`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    
    const data = response.data.quoteSummary.result[0];
    const summary = data.summaryDetail || {};
    const stats = data.defaultKeyStatistics || {};
    const financial = data.financialData || {};
    
    return {
      marketCap: summary.marketCap?.raw || null,
      peRatio: summary.trailingPE?.raw || null,
      forwardPE: summary.forwardPE?.raw || null,
      eps: stats.trailingEps?.raw || null,
      epsGrowth: stats.epsTrailingYearsGrowth?.raw || null,
      revenue: summary.totalRevenue?.raw || null,
      revenueGrowth: financial.revenueGrowth?.raw || null,
      profitMargin: financial.profitMargin?.raw || null,
      operatingMargin: financial.operatingMargins?.raw || null,
      roe: financial.returnOnEquity?.raw || null,
      debtToEquity: summary.debtToEquity?.raw || null,
      currentRatio: summary.currentRatio?.raw || null,
      quickRatio: summary.quickRatio?.raw || null,
      beta: summary.beta?.raw || null,
      dividendYield: summary.dividendYield?.raw || null,
      dividendRate: summary.dividendRate?.raw || null,
      fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh?.raw || null,
      fiftyTwoWeekLow: summary.fiftyTwoWeekLow?.raw || null,
      targetPrice: financial.guidance?.raw || null,
      recommendation: financial.recommendationKey || null
    };
  } catch (error) {
    // 如果取不到詳細資料，回傳估算值
    return {
      marketCap: null,
      peRatio: null,
      eps: null,
      revenue: null,
      recommendation: 'no_data'
    };
  }
}

// 取得熱力圖數據
async function getTreemapData() {
  const result = [];
  
  for (const stock of TREEMAP_STOCKS) {
    const quote = await getStockQuote(stock.symbol, '1mo');
    if (quote) {
      result.push({
        symbol: stock.symbol.replace('.TW', ''),
        name: stock.name,
        sector: stock.sector,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        marketCap: quote.volume * quote.price
      });
    }
    await new Promise(r => setTimeout(r, 50));
  }
  
  return result;
}

// 取得新聞
async function getNews() {
  try {
    const response = await axios.get('https://feeds.finance.yahoo.com/rss/2.0/headline?s=^TWII&region=US&lang=en-US', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data, { xml: true });
    const news = [];
    
    $('item').each((i, el) => {
      if (i < 8) {
        news.push({
          title: $(el).find('title').text(),
          link: $(el).find('link').text(),
          pubDate: $(el).find('pubDate').text()
        });
      }
    });
    
    return news;
  } catch (error) {
    console.error('News fetch error:', error.message);
    return [];
  }
}

// ============ API 路由 ============

// 取得報價（加入技術指標）
app.get('/api/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const quote = await getStockQuote(symbol);
  
  if (quote) {
    res.json(quote);
  } else {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// 取得基本面相資料
app.get('/api/fundamental/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const data = await getFundamentalData(symbol);
  res.json(data);
});

// 取得完整分析（技術 + 基本面）
app.get('/api/analysis/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const [quote, fundamental] = await Promise.all([
    getStockQuote(symbol),
    getFundamentalData(symbol)
  ]);
  
  if (quote) {
    res.json({ ...quote, fundamental });
  } else {
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// 比較兩檔股票
app.get('/api/compare/:symbols', async (req, res) => {
  const symbols = req.params.symbols.split(',');
  const results = [];
  
  for (const symbol of symbols) {
    const [quote, fundamental] = await Promise.all([
      getStockQuote(symbol),
      getFundamentalData(symbol)
    ]);
    if (quote) {
      results.push({ symbol, ...quote, fundamental });
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  res.json({ stocks: results, timestamp: new Date().toISOString() });
});

// 取得技術分析摘要
app.get('/api/technical/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const quote = await getStockQuote(symbol);
  
  if (!quote) {
    return res.status(500).json({ error: 'Failed to fetch technical data' });
  }
  
  // 技術分析信號
  const signals = [];
  
  // RSI 分析
  if (quote.rsi !== null) {
    if (quote.rsi > 70) signals.push({ indicator: 'RSI', signal: 'overbought', value: quote.rsi, action: '建議賣出' });
    else if (quote.rsi < 30) signals.push({ indicator: 'RSI', signal: 'oversold', value: quote.rsi, action: '建議買入' });
    else signals.push({ indicator: 'RSI', signal: 'neutral', value: quote.rsi, action: '中性' });
  }
  
  // KD 分析
  if (quote.kd !== null) {
    if (quote.kd > 80) signals.push({ indicator: 'KD', signal: 'overbought', value: quote.kd, action: '高檔區' });
    else if (quote.kd < 20) signals.push({ indicator: 'KD', signal: 'oversold', value: quote.kd, action: '低檔區' });
    else signals.push({ indicator: 'KD', signal: 'neutral', value: quote.kd, action: '中性' });
  }
  
  // MA 分析
  if (quote.ma5 && quote.ma20) {
    if (quote.ma5 > quote.ma20) signals.push({ indicator: 'MA', signal: 'golden_cross', value: `MA5=${quote.ma5} > MA20=${quote.ma20}`, action: '多頭排列' });
    else signals.push({ indicator: 'MA', signal: 'death_cross', value: `MA5=${quote.ma5} < MA20=${quote.ma20}`, action: '空頭排列' });
  }
  
  // MACD 分析
  if (quote.macd) {
    if (quote.macd.histogram > 0) signals.push({ indicator: 'MACD', signal: 'bullish', value: quote.macd.macd.toFixed(2), action: '多方訊號' });
    else signals.push({ indicator: 'MACD', signal: 'bearish', value: quote.macd.macd.toFixed(2), action: '空方訊號' });
  }
  
  res.json({
    symbol: quote.symbol,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    indicators: {
      rsi: quote.rsi,
      kd: quote.kd,
      macd: quote.macd,
      ma5: quote.ma5,
      ma20: quote.ma20,
      ma60: quote.ma60
    },
    supportResistance: quote.supportResistance,
    signals: signals,
    timestamp: new Date().toISOString()
  });
});

// 取得多支股票報價
app.get('/api/quotes/:region', async (req, res) => {
  const region = req.params.region;
  const symbols = STOCKS[region] || STOCKS.tw;
  
  const quotes = {};
  for (const [name, symbol] of Object.entries(symbols)) {
    const quote = await getStockQuote(symbol);
    if (quote) {
      quotes[name] = quote;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  
  res.json(quotes);
});

app.get('/api/treemap', async (req, res) => {
  const data = await getTreemapData();
  res.json(data);
});

app.get('/api/news', async (req, res) => {
  const news = await getNews();
  res.json(news);
});

// 簡單的建議引擎
app.get('/api/advice', async (req, res) => {
  try {
    const [sp500, nasdaq, dow] = await Promise.all([
      getStockQuote('^GSPC'),
      getStockQuote('^IXIC'),
      getStockQuote('^DJI')
    ]);
    
    let sentiment = 'neutral';
    let direction = '觀望';
    let riskLevel = '中';
    
    if (sp500 && nasdaq && dow) {
      const avgChange = (sp500.changePercent + nasdaq.changePercent + dow.changePercent) / 3;
      
      if (avgChange > 1) {
        sentiment = 'bullish';
        direction = '偏多';
        riskLevel = '低';
      } else if (avgChange < -1) {
        sentiment = 'bearish';
        direction = '偏空';
        riskLevel = '高';
      }
    }
    
    res.json({
      sentiment,
      direction,
      riskLevel,
      summary: `美股三大指數平均表現為 ${direction}，建議 ${riskLevel} 風險操作`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 用戶資訊
app.get('/api/user', (req, res) => {
  res.json(USER_INFO);
});

// 警示設定
let alertConfig = {};
app.post('/api/alert', express.json(), (req, res) => {
  const { symbol, priceAbove, priceBelow } = req.body;
  alertConfig[symbol] = { priceAbove, priceBelow, enabled: true };
  res.json({ success: true, config: alertConfig });
});

app.get('/api/alert/:symbol', (req, res) => {
  const config = alertConfig[req.params.symbol];
  res.json(config || { enabled: false });
});

// ============ 啟動 ============

app.listen(PORT, () => {
  console.log(`📊 看盤系統 v3 已啟動: http://localhost:${PORT}`);
  console.log(`👤 使用者: ${USER_INFO.name} (${USER_INFO.username})`);
});