// Compare PolarisBot (old) vs QBot (new) on real data
import https from 'https';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': 'MarketPulse/1.0' } };
    https.get(url, opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { const j = JSON.parse(data); if (j.status?.error_code) reject(new Error(j.status.error_message)); else resolve(j); }
        catch(e) { reject(new Error(`Parse error: ${data.slice(0,200)}`)); }
      });
    }).on('error', reject);
  });
}

function aggregateCandles(prices) {
  const candles = [];
  const interval = 4 * 3600 * 1000;
  let bucket = null, bucketStartMs = 0;
  for (const [ts, price] of prices) {
    const bs = Math.floor(ts / interval) * interval;
    if (!bucket || bs !== bucketStartMs) {
      if (bucket) candles.push(bucket);
      bucketStartMs = bs;
      bucket = { time: bs / 1000, open: price, high: price, low: price, close: price, volume: 0 };
    } else {
      bucket.high = Math.max(bucket.high, price);
      bucket.low = Math.min(bucket.low, price);
      bucket.close = price;
    }
    bucket.volume += Math.abs(price - bucket.open);
  }
  if (bucket) candles.push(bucket);
  return candles;
}

function calcSMA(data, period) {
  const r = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { r.push(null); continue; }
    let s = 0; for (let j = 0; j < period; j++) s += data[i - j];
    r.push(s / period);
  }
  return r;
}

function calcRSI(data, period = 14) {
  const r = [null]; let g = 0, l = 0;
  for (let i = 1; i < data.length; i++) {
    const d = data[i] - data[i - 1];
    if (d > 0) g += d; else l -= d;
    if (i < period) { r.push(null); continue; }
    if (l === 0) { r.push(100); continue; }
    r.push(100 - 100 / (1 + g / period / (l / period)));
    const pg = Math.max(0, data[i - period + 1] - data[i - period]); g -= pg / period;
    const pl = Math.max(0, data[i - period] - data[i - period + 1]); l -= pl / period;
  }
  return r;
}

function calcBollinger(data, period = 20, m = 2) {
  const sma = calcSMA(data, period), u = [], lo = [];
  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null) { u.push(null); lo.push(null); continue; }
    let ss = 0; for (let j = 0; j < period && i - j >= 0; j++) ss += Math.pow(data[i - j] - sma[i], 2);
    const std = Math.sqrt(ss / period); u.push(sma[i] + m * std); lo.push(sma[i] - m * std);
  }
  return { sma, upper: u, lower: lo };
}

function calcATR(candles, period = 14) {
  const r = [null];
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(candles[i].high - candles[i].low, Math.abs(candles[i].high - candles[i-1].close), Math.abs(candles[i].low - candles[i-1].close));
    if (i < period) { r.push(null); continue; }
    r.push(r[i-1] === null ? tr : (r[i-1] * (period - 1) + tr) / period);
  }
  return r;
}

function calcMACD(data) {
  const k12 = 2 / 13, k26 = 2 / 27;
  let e12 = data.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
  let e26 = data.slice(0, 26).reduce((a, b) => a + b, 0) / 26;
  const macd = [], sig = [], hist = [], vm = [];
  for (let i = 0; i < data.length; i++) {
    if (i < 25) { if (i >= 11) e12 = data[i] * k12 + e12 * (1 - k12); if (i >= 25) e26 = data[i] * k26 + e26 * (1 - k26); macd.push(null); sig.push(null); hist.push(null); continue; }
    e12 = data[i] * k12 + e12 * (1 - k12); e26 = data[i] * k26 + e26 * (1 - k26);
    const m = e12 - e26; macd.push(m); vm.push(m);
    if (vm.length < 9) { sig.push(null); hist.push(null); continue; }
    const s = vm.slice(-9).reduce((a, b) => a + b, 0) / 9; sig.push(s); hist.push(m - s);
  }
  return { macd, signal: sig, histogram: hist };
}

// ---- PolarisBot (old) ----
function polarisStrategy(closes) {
  const s20 = calcSMA(closes, 20), s50 = calcSMA(closes, 50), s200 = calcSMA(closes, 200);
  const signals = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < 1 || !s20[i] || !s50[i]) { signals.push({ action: 'hold', confidence: 0 }); continue; }
    const p20 = s20[i-1], c20 = s20[i], p50 = s50[i-1], c50 = s50[i];
    if (p20 <= p50 && c20 > c50 && c50 > (s200[i] || 0)) signals.push({ action: 'buy', confidence: 80 });
    else if (p20 >= p50 && c20 < c50 && c50 < (s200[i] || 1/0)) signals.push({ action: 'sell', confidence: 75 });
    else if (c20 > c50 && closes[i] > c20) signals.push({ action: 'buy', confidence: 45 });
    else if (c20 < c50 && closes[i] < c20) signals.push({ action: 'sell', confidence: 40 });
    else signals.push({ action: 'hold', confidence: 30 });
  }
  return signals;
}

// ---- QBot / DQN Strategy (ported from TypeScript) ----
class NN {
  constructor(is, hs, os) {
    this.w1 = Array.from({length: is}, () => Array.from({length: hs}, () => (Math.random()-0.5)*Math.sqrt(2/is)));
    this.b1 = new Array(hs).fill(0);
    this.w2 = Array.from({length: hs}, () => Array.from({length: hs}, () => (Math.random()-0.5)*Math.sqrt(2/hs)));
    this.b2 = new Array(hs).fill(0);
    this.w3 = Array.from({length: hs}, () => Array.from({length: os}, () => (Math.random()-0.5)*Math.sqrt(2/hs)));
    this.b3 = new Array(os).fill(0);
  }
  forward(inp) {
    const h1 = this.w1[0].map((_,j) => { let s = this.b1[j]; for (let i = 0; i < inp.length; i++) s += this.w1[i][j]*inp[i]; return Math.max(0,s); });
    const h2 = this.w2[0].map((_,j) => { let s = this.b2[j]; for (let i = 0; i < h1.length; i++) s += this.w2[i][j]*h1[i]; return Math.max(0,s); });
    return this.w3[0].map((_,j) => { let s = this.b3[j]; for (let i = 0; i < h2.length; i++) s += this.w3[i][j]*h2[i]; return s; });
  }
  trainBatch(inputs, targets, lr) {
    const bs = inputs.length, hs1 = this.b1.length, hs2 = this.b2.length, os = this.b3.length, is = this.w1.length;
    let gw1 = Array.from({length: is}, () => new Array(hs1).fill(0));
    let gb1 = new Array(hs1).fill(0);
    let gw2 = Array.from({length: hs1}, () => new Array(hs2).fill(0));
    let gb2 = new Array(hs2).fill(0);
    let gw3 = Array.from({length: hs2}, () => new Array(os).fill(0));
    let gb3 = new Array(os).fill(0);
    for (let b = 0; b < bs; b++) {
      const inp = inputs[b], target = targets[b];
      const z1 = [], a1 = [];
      for (let j = 0; j < hs1; j++) { let s = this.b1[j]; for (let i = 0; i < is; i++) s += this.w1[i][j]*inp[i]; z1.push(s); a1.push(Math.max(0,s)); }
      const z2 = [], a2 = [];
      for (let j = 0; j < hs2; j++) { let s = this.b2[j]; for (let i = 0; i < hs1; i++) s += this.w2[i][j]*a1[i]; z2.push(s); a2.push(Math.max(0,s)); }
      const out = [];
      for (let j = 0; j < os; j++) { let s = this.b3[j]; for (let i = 0; i < hs2; i++) s += this.w3[i][j]*a2[i]; out.push(s); }
      const dOut = out.map((o, j) => o - target[j]);
      for (let i = 0; i < hs2; i++) for (let j = 0; j < os; j++) gw3[i][j] += dOut[j] * a2[i];
      for (let j = 0; j < os; j++) gb3[j] += dOut[j];
      const dH2 = Array.from({length: hs2}, (_, i) => { let s = 0; for (let j = 0; j < os; j++) s += this.w3[i][j]*dOut[j]; return s * (z2[i] > 0 ? 1 : 0); });
      for (let i = 0; i < hs1; i++) for (let j = 0; j < hs2; j++) gw2[i][j] += dH2[j] * a1[i];
      for (let j = 0; j < hs2; j++) gb2[j] += dH2[j];
      const dH1 = Array.from({length: hs1}, (_, i) => { let s = 0; for (let j = 0; j < hs2; j++) s += this.w2[i][j]*dH2[j]; return s * (z1[i] > 0 ? 1 : 0); });
      for (let i = 0; i < is; i++) for (let j = 0; j < hs1; j++) gw1[i][j] += dH1[j] * inp[i];
      for (let j = 0; j < hs1; j++) gb1[j] += dH1[j];
    }
    const sc = lr / bs;
    for (let i = 0; i < is; i++) for (let j = 0; j < hs1; j++) this.w1[i][j] -= sc * gw1[i][j];
    for (let j = 0; j < hs1; j++) this.b1[j] -= sc * gb1[j];
    for (let i = 0; i < hs1; i++) for (let j = 0; j < hs2; j++) this.w2[i][j] -= sc * gw2[i][j];
    for (let j = 0; j < hs2; j++) this.b2[j] -= sc * gb2[j];
    for (let i = 0; i < hs2; i++) for (let j = 0; j < os; j++) this.w3[i][j] -= sc * gw3[i][j];
    for (let j = 0; j < os; j++) this.b3[j] -= sc * gb3[j];
  }
}

function extractFeatures(i, closes, s20, s50, rsi, bb, atr, mHist, volSma, candles) {
  const c = closes[i];
  const feats = [
    c / (s20[i] ?? c), c / (s50[i] ?? c), (rsi[i] ?? 50) / 100,
    i >= 5 ? (c - closes[i-5]) / closes[i-5] : 0,
    (atr[i] ?? 0) / (c || 1),
    (c - (bb.lower[i] ?? c)) / ((bb.upper[i] ?? c) - (bb.lower[i] ?? c) || 1),
    (candles[i]?.volume ?? 0) / (volSma[i] ?? candles[i]?.volume ?? 1),
    Math.tanh((mHist[i] ?? 0) / (c || 1) * 100)
  ];
  for (let j = 0; j < feats.length; j++) {
    if (!isFinite(feats[j])) feats[j] = 0;
    if (Math.abs(feats[j]) > 10) feats[j] = Math.sign(feats[j]) * 10;
  }
  return feats;
}

function qlStrategy(closes, candles) {
  const H = 4, LEV = 5, EP = 8, WU = 50;
  const s20 = calcSMA(closes, 20), s50 = calcSMA(closes, 50);
  const rsi = calcRSI(closes), bb = calcBollinger(closes);
  const atr = calcATR(candles), { histogram } = calcMACD(closes);
  const vs = calcSMA(candles.map(c => c.volume), 20);

  const feats = closes.map((_, i) => extractFeatures(i, closes, s20, s50, rsi, bb, atr, histogram, vs, candles));
  const fwd = closes.map((_, i) => { const f = Math.min(i+H, closes.length-1); return (closes[f]-closes[i])/closes[i]; });
  const trainEnd = Math.floor(closes.length * 0.8);

  const agent = { network: new NN(8, 16, 3), target: null, eps: 0.5, lr: 0.01, gamma: 0.9, buf: [], maxBuf: 500, bs: 64, step: 0 };
  agent.target = agent.network;

  function getQ(s) { return agent.network.forward(s); }
  function selectAction(s) {
    if (Math.random() < agent.eps) return Math.floor(Math.random() * 3);
    const q = getQ(s); return q.indexOf(Math.max(...q));
  }
  function store(s, a, r, ns, d) {
    agent.buf.push({state:s, action:a, reward:r, nextState:ns, done:d});
    if (agent.buf.length > agent.maxBuf) agent.buf.shift();
  }
  function train() {
    if (agent.buf.length < agent.bs) return;
    const shuffled = [...agent.buf].sort(() => Math.random() - 0.5).slice(0, agent.bs);
    const inputs = [], targets = [];
    for (const e of shuffled) {
      const qp = getQ(e.state), qn = agent.target.forward(e.nextState);
      const mnq = e.done ? 0 : Math.max(...qn);
      const tq = [...qp]; tq[e.action] = e.reward + agent.gamma * mnq;
      inputs.push(e.state); targets.push(tq);
    }
    agent.network.trainBatch(inputs, targets, agent.lr);
    agent.step++;
    if (agent.step % 50 === 0) agent.target = agent.network;
  }

  const trainFwd = fwd.slice(WU, trainEnd - H);
  const baseline = trainFwd.length ? trainFwd.reduce((a,b)=>a+b,0)/trainFwd.length : 0;

  for (let ep = 0; ep < EP; ep++) {
    for (let i = WU; i < trainEnd - H; i++) {
      const s = feats[i], a = selectAction(s);
      const fr = fwd[i];
      const excessR = a === 0 ? fr - baseline : a === 1 ? -(fr - baseline) : -Math.abs(fr - baseline)*0.5;
      const r = excessR*LEV*100 - Math.abs(fr)*15;
      const ns = feats[Math.min(i+H, trainEnd-1)];
      store(s, a, r, ns, i+H >= trainEnd-H);
      if (i % 4 === 0) train();
    }
    agent.eps = Math.max(0.05, agent.eps * 0.9);
  }

  const signals = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < WU || feats[i].some(f => !isFinite(f))) { signals.push({ action: 'hold', confidence: 0 }); continue; }
    const q = getQ(feats[i]), ba = q.indexOf(Math.max(...q));
    const qs = Math.max(...q) - Math.min(...q);
    const conf = Math.min(95, Math.max(10, Math.round(30 + qs * 15)));
    signals.push({ action: ['buy','sell','hold'][ba], confidence: conf });
  }
  return signals;
}

function simulateTrades(signals, closes, leverage, tp, sl) {
  const trades = []; let position = null, entryPrice = 0, entryIdx = 0;
  for (let i = 50; i < signals.length; i++) {
    const sig = signals[i];
    if (!position && sig.action === 'buy' && sig.confidence >= 55) { position = 'buy'; entryPrice = closes[i]; entryIdx = i; }
    else if (!position && sig.action === 'sell' && sig.confidence >= 55) { position = 'sell'; entryPrice = closes[i]; entryIdx = i; }
    else if (position) {
      const exitPrice = closes[i]; const isLong = position === 'buy';
      const rawRoi = ((isLong ? exitPrice - entryPrice : entryPrice - exitPrice) / entryPrice);
      const roi = rawRoi * leverage * 100;
      const hitTP = isLong ? (exitPrice >= entryPrice * (1 + tp)) : (exitPrice <= entryPrice * (1 - tp));
      const hitSL = isLong ? (exitPrice <= entryPrice * (1 - sl)) : (exitPrice >= entryPrice * (1 + sl));
      if (sig.action !== position || i - entryIdx > 48 || sig.confidence < 15 || hitTP || hitSL) {
        trades.push({ action: position === 'buy' ? 'sell' : 'buy', roi: Math.round(roi*10)/10 });
        position = null;
      }
    }
  }
  return trades;
}

function calcStats(trades) {
  const won = trades.filter(t => t.roi > 0), lost = trades.filter(t => t.roi <= 0);
  const rets = trades.map(t => t.roi);
  const avgR = rets.length ? rets.reduce((a,b)=>a+b,0)/rets.length : 0;
  const var_ = rets.length ? rets.reduce((a,b)=>a+Math.pow(b-avgR,2),0)/rets.length : 1;
  const sharpe = Math.sqrt(252)*(avgR/100)/Math.sqrt(Math.max(var_/10000,0.0001));
  let peak=0, maxDD=0, cum=0;
  for (const r of rets) { cum+=r; peak=Math.max(peak,cum); maxDD=Math.max(maxDD,peak-cum); }
  return { total: trades.length, won: won.length, lost: lost.length, wr: Math.round(won.length/trades.length*1000)/10||0, sharpe: Math.round(sharpe*100)/100, maxDD: Math.round(maxDD*10)/10 };
}

async function main() {
  const symbols = ['BTC', 'ETH'];
  for (const sym of symbols) {
    const ids = {BTC:'bitcoin',ETH:'ethereum',SOL:'solana',XRP:'ripple',ADA:'cardano'};
    console.log(`\n========== ${sym} (${ids[sym]}) ==========`);
    
    const data = await httpsGet(`https://api.coingecko.com/api/v3/coins/${ids[sym]}/market_chart?vs_currency=usd&days=90`);
    const candles = aggregateCandles(data.prices);
    const closes = candles.map(c => c.close);
    console.log(`Candles: ${candles.length} (4h)`);

    const bots = [
      { name: 'PolarisBot (old)', leverage: 5, tp: 0.06, sl: 0.03, fn: polarisStrategy },
      { name: 'QBot (DQN)', leverage: 5, tp: 0.06, sl: 0.03, fn: qlStrategy },
    ];

    for (const bot of bots) {
      const start = Date.now();
      const signals = bot.fn(closes, candles);
      const trainTime = Date.now() - start;
      const trades = simulateTrades(signals, closes, bot.leverage, bot.tp, bot.sl);
      const stats = calcStats(trades);
      
      const buys = signals.filter(s => s.action === 'buy' && s.confidence >= 55).length;
      const sells = signals.filter(s => s.action === 'sell' && s.confidence >= 55).length;
      const last = signals[signals.length-1];

      console.log(`\n${bot.name}:`);
      console.log(`  Train: ${trainTime}ms | Trades: ${stats.total} (W ${stats.won}/L ${stats.lost}) | WR: ${stats.wr}%`);
      console.log(`  Sharpe: ${stats.sharpe} | MaxDD: ${stats.maxDD}%`);
      console.log(`  Signals: ${buys}B / ${sells}S | Current: ${last.action.toUpperCase()} (${last.confidence}%)`);
    }
  }
}

main().catch(console.error);
