import { useEffect, useState } from 'react';
import { Activity, RefreshCcw } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { formatPercent } from '../lib/format';
import type { StocksOverview } from '../types';

const emptyStocks: StocksOverview = {
  marketDate: '',
  source: '',
  indices: [],
  chart: [],
  topStocks: [],
};

export function StockMarket() {
  const [overview, setOverview] = useState<StocksOverview>(emptyStocks);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadStocks() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<StocksOverview>('/stocks/overview');
      setOverview(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load market data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStocks();
  }, []);

  const marketDateLabel = overview.marketDate
    ? new Date(overview.marketDate).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
      })
    : 'Waiting for latest market snapshot';

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Stock Market</h2>
              <p className="mt-1 text-sm text-slate-500">Current-day market prices with a cleaner intraday chart.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
              {loading ? 'Refreshing live prices...' : `Updated: ${marketDateLabel}`}
            </span>
            <button
              onClick={() => void loadStocks()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {overview.indices.map((index) => (
          <article key={index.symbol} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{index.symbol}</p>
            <h3 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{index.value.toLocaleString('en-IN')}</h3>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={index.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {formatPercent(index.changePercent)}
              </span>
              <span className="text-slate-500">Prev close {index.previousClose.toLocaleString('en-IN')}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Intraday market movement</h3>
            <p className="mt-1 text-sm text-slate-500">NIFTY 50 and SENSEX plotted together with smoother gradients for quicker comparison.</p>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{overview.source || 'Live source pending'}</span>
        </div>

        <div className="mt-6 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overview.chart}>
              <defs>
                <linearGradient id="niftyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="sensexFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} width={80} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  borderRadius: '18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="nifty" name="NIFTY 50" stroke="#0f766e" fill="url(#niftyFill)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="nifty" stroke="#0f766e" dot={false} strokeWidth={2.5} />
              <Area type="monotone" dataKey="sensex" name="SENSEX" stroke="#2563eb" fill="url(#sensexFill)" strokeWidth={2.5} />
              <Line type="monotone" dataKey="sensex" stroke="#2563eb" dot={false} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Top tracked stocks</h3>
            <p className="mt-1 text-sm text-slate-500">Prices are requested from the backend when this tab opens.</p>
          </div>
          <span className="text-xs text-slate-500">For educational use only</span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="pb-2 font-medium">Company</th>
                <th className="pb-2 font-medium">Symbol</th>
                <th className="pb-2 text-right font-medium">Price</th>
                <th className="pb-2 text-right font-medium">Change</th>
                <th className="pb-2 text-right font-medium">Volume</th>
              </tr>
            </thead>
            <tbody>
              {overview.topStocks.map((stock) => (
                <tr key={stock.symbol} className="rounded-2xl bg-slate-50 text-sm">
                  <td className="rounded-l-2xl px-4 py-4 font-medium text-slate-900">{stock.name}</td>
                  <td className="px-4 py-4 text-slate-500">{stock.symbol}</td>
                  <td className="px-4 py-4 text-right font-medium text-slate-900">Rs. {stock.price.toLocaleString('en-IN')}</td>
                  <td className={`px-4 py-4 text-right font-semibold ${stock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercent(stock.changePercent)}
                  </td>
                  <td className="rounded-r-2xl px-4 py-4 text-right text-slate-500">{stock.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
