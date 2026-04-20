const QUOTE_SYMBOLS = [
  '^NSEI',
  '^BSESN',
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'BHARTIARTL.NS',
];

const TOP_STOCK_SYMBOLS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'BHARTIARTL.NS'];

const headers = {
  'User-Agent': 'Mozilla/5.0 PaisaBuddy/1.0',
  Accept: 'application/json',
};

function formatVolume(volume) {
  if (volume >= 1_00_00_000) {
    return `${(volume / 1_00_00_000).toFixed(2)} Cr`;
  }

  if (volume >= 1_00_000) {
    return `${(volume / 1_00_000).toFixed(2)} L`;
  }

  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)} K`;
  }

  return `${volume}`;
}

function mapTimeLabel(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  });
}

async function fetchJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Stock data request failed: ${response.status}`);
  }

  return response.json();
}

async function fetchQuotes() {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(QUOTE_SYMBOLS.join(','))}`;
  const data = await fetchJson(url);
  return data.quoteResponse?.result || [];
}

async function fetchIntradayChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=15m&range=1d&includePrePost=false`;
  const data = await fetchJson(url);
  const result = data.chart?.result?.[0];

  if (!result) {
    return [];
  }

  const closes = result.indicators?.quote?.[0]?.close || [];
  const timestamps = result.timestamp || [];

  return timestamps
    .map((timestamp, index) => ({
      timestamp,
      time: mapTimeLabel(timestamp),
      price: closes[index],
    }))
    .filter((point) => typeof point.price === 'number');
}

function buildMergedChart(niftySeries, sensexSeries) {
  const merged = new Map();

  for (const point of niftySeries) {
    merged.set(point.timestamp, {
      time: point.time,
      nifty: Number(point.price.toFixed(2)),
      sensex: null,
    });
  }

  for (const point of sensexSeries) {
    if (!merged.has(point.timestamp)) {
      merged.set(point.timestamp, {
        time: point.time,
        nifty: null,
        sensex: Number(point.price.toFixed(2)),
      });
      continue;
    }

    merged.get(point.timestamp).sensex = Number(point.price.toFixed(2));
  }

  return [...merged.entries()]
    .sort((first, second) => first[0] - second[0])
    .map(([, value]) => value);
}

function buildFallbackOverview() {
  const now = new Date();
  const chart = [
    { time: '09:30', nifty: 22310, sensex: 73480 },
    { time: '10:00', nifty: 22342, sensex: 73530 },
    { time: '10:30', nifty: 22308, sensex: 73462 },
    { time: '11:00', nifty: 22395, sensex: 73610 },
    { time: '11:30', nifty: 22420, sensex: 73692 },
    { time: '12:00', nifty: 22388, sensex: 73620 },
    { time: '12:30', nifty: 22448, sensex: 73730 },
    { time: '13:00', nifty: 22460, sensex: 73780 },
    { time: '13:30', nifty: 22422, sensex: 73705 },
    { time: '14:00', nifty: 22490, sensex: 73840 },
    { time: '14:30', nifty: 22508, sensex: 73895 },
    { time: '15:00', nifty: 22486, sensex: 73862 },
  ];

  return {
    marketDate: now.toISOString(),
    source: 'Fallback sample data',
    indices: [
      { symbol: 'NIFTY 50', value: 22486, changePercent: 0.79, previousClose: 22310 },
      { symbol: 'SENSEX', value: 73862, changePercent: 0.52, previousClose: 73480 },
    ],
    chart,
    topStocks: [
      { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2942.55, changePercent: 1.12, volume: '61.50 L' },
      { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4016.35, changePercent: -0.34, volume: '8.10 L' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1684.9, changePercent: 0.46, volume: '42.24 L' },
      { symbol: 'INFY', name: 'Infosys', price: 1518.45, changePercent: 0.62, volume: '18.35 L' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1129.2, changePercent: 0.71, volume: '39.52 L' },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1496.4, changePercent: 1.83, volume: '14.90 L' },
    ],
  };
}

export async function getMarketOverview() {
  try {
    const [quotes, niftySeries, sensexSeries] = await Promise.all([
      fetchQuotes(),
      fetchIntradayChart('^NSEI'),
      fetchIntradayChart('^BSESN'),
    ]);

    const indices = quotes
      .filter((quote) => quote.symbol === '^NSEI' || quote.symbol === '^BSESN')
      .map((quote) => ({
        symbol: quote.symbol === '^NSEI' ? 'NIFTY 50' : 'SENSEX',
        value: Number((quote.regularMarketPrice || 0).toFixed(2)),
        changePercent: Number((quote.regularMarketChangePercent || 0).toFixed(2)),
        previousClose: Number((quote.regularMarketPreviousClose || 0).toFixed(2)),
      }));

    const topStocks = quotes
      .filter((quote) => TOP_STOCK_SYMBOLS.includes(quote.symbol))
      .map((quote) => ({
        symbol: quote.symbol.replace('.NS', ''),
        name: quote.shortName || quote.longName || quote.symbol,
        price: Number((quote.regularMarketPrice || 0).toFixed(2)),
        changePercent: Number((quote.regularMarketChangePercent || 0).toFixed(2)),
        volume: formatVolume(quote.regularMarketVolume || 0),
      }));

    const marketDate = quotes[0]?.regularMarketTime
      ? new Date(quotes[0].regularMarketTime * 1000).toISOString()
      : new Date().toISOString();

    return {
      marketDate,
      source: 'Yahoo Finance',
      indices,
      chart: buildMergedChart(niftySeries, sensexSeries),
      topStocks,
    };
  } catch (error) {
    console.error('Live market fetch failed. Falling back to sample data.', error.message);
    return buildFallbackOverview();
  }
}
