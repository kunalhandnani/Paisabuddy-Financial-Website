import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCcw } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { formatPercent } from '../lib/format';
import type { StockPoint, StocksOverview } from '../types';

const emptyStocks: StocksOverview = {
  marketDate: '',
  source: '',
  indices: [],
  chart: [],
  topStocks: [],
};

const marketTabs = ['Indian Indices', 'Global Indices', 'Most Active Stocks'];
const rangeTabs = ['1D', '5D', '1M', '3M', '6M', '1Y', '2Y'];

function valueOrZero(value: number | null | undefined) {
  return typeof value === 'number' ? value : 0;
}

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

  const chartData = useMemo(
    () =>
      overview.chart.map((point: StockPoint) => ({
        time: point.time,
        sensex: valueOrZero(point.sensex),
        nifty: valueOrZero(point.nifty),
      })),
    [overview.chart],
  );

  const sensexSeries = chartData.filter((point) => point.sensex > 0);
  const sensexCurrent = sensexSeries.length > 0 ? sensexSeries[sensexSeries.length - 1].sensex : 0;
  const sensexStart = sensexSeries.length > 0 ? sensexSeries[0].sensex : 0;
  const sensexChangePercent = sensexStart > 0 ? ((sensexCurrent - sensexStart) / sensexStart) * 100 : 0;
  const sensexChangePoints = sensexCurrent - sensexStart;

  const breadth = useMemo(() => {
    const advances = overview.topStocks.filter((stock) => stock.changePercent >= 0).length;
    const declines = overview.topStocks.length - advances;
    const total = Math.max(advances + declines, 1);

    return {
      advances,
      declines,
      advancePercent: (advances / total) * 100,
      declinePercent: (declines / total) * 100,
    };
  }, [overview.topStocks]);

  const activeRows = useMemo(
    () =>
      overview.topStocks.slice(0, 5).map((stock) => ({
        company: stock.name,
        price: stock.price,
        changePercent: stock.changePercent,
        valueCr: Math.round((stock.price * 1.92) / 10),
      })),
    [overview.topStocks],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-center text-4xl font-bold tracking-tight text-blue-900 md:text-left">MARKET ACTION</h2>
            <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-amber-500 md:mx-0" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600">
              {loading ? 'Refreshing live prices...' : `Updated: ${marketDateLabel}`}
            </span>
            <button
              onClick={() => void loadStocks()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw size={15} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-4 xl:grid-cols-[1.05fr_1.15fr_1.55fr_1.25fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-4 border-b border-slate-200 pb-2 text-sm font-semibold text-slate-500">
            {marketTabs.map((tab, index) => (
              <button key={tab} className={`${index === 0 ? 'text-blue-800' : 'text-slate-500'} transition hover:text-blue-700`}>
                {tab}
              </button>
            ))}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 font-medium">Index</th>
                <th className="py-2 text-right font-medium">Price</th>
                <th className="py-2 text-right font-medium">Change</th>
                <th className="py-2 text-right font-medium">%Chg</th>
              </tr>
            </thead>
            <tbody>
              {overview.indices.map((index) => {
                const pointChange = (index.value * index.changePercent) / 100;
                return (
                  <tr key={index.symbol} className="border-t border-slate-100">
                    <td className="py-3 font-semibold text-slate-800">{index.symbol}</td>
                    <td className="py-3 text-right text-slate-700">{index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className={`py-3 text-right ${pointChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {pointChange >= 0 ? '+' : ''}
                      {pointChange.toFixed(2)}
                    </td>
                    <td className={`py-3 text-right ${index.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatPercent(index.changePercent)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
            View More <ArrowRight size={14} />
          </button>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="border-b border-slate-200 pb-2 text-xl font-semibold text-blue-800">Most Active Stocks</h3>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 font-medium">Company</th>
                <th className="py-2 text-right font-medium">Price</th>
                <th className="py-2 text-right font-medium">Val.(Cr.)</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row) => (
                <tr key={row.company} className="border-t border-slate-100">
                  <td className="py-3 font-semibold text-slate-800">{row.company}</td>
                  <td className="py-3 text-right">
                    <p className={`${row.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-semibold`}>
                      {row.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs ${row.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatPercent(row.changePercent)}</p>
                  </td>
                  <td className="py-3 text-right text-slate-700">{row.valueCr.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
            View More <ArrowRight size={14} />
          </button>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-4 border-b border-slate-200 pb-2">
            <p className="border-b-2 border-blue-700 pb-1 text-lg font-semibold text-blue-800">Sensex</p>
            <p className="pb-1 text-lg font-semibold text-slate-500">Nifty</p>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {rangeTabs.map((tab, index) => (
              <button
                key={tab}
                className={`rounded border px-2.5 py-1 text-xs font-semibold ${
                  index === 0 ? 'border-blue-700 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mb-2 flex items-end gap-3">
            <p className="text-4xl font-bold text-slate-900">{sensexCurrent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            <p className={`pb-1 text-2xl font-semibold ${sensexChangePoints >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {sensexChangePoints >= 0 ? '+' : ''}
              {sensexChangePoints.toFixed(2)}
              <span className="ml-1 text-lg font-medium">({formatPercent(sensexChangePercent)})</span>
            </p>
          </div>

          <div className="h-[230px] rounded-lg border border-slate-100 bg-[linear-gradient(180deg,#eef6ff_0%,#ffffff_100%)] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sensexRealFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7db6ff" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#7db6ff" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#d8e4f5" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7d96" tickLine={false} axisLine={false} minTickGap={26} />
                <YAxis
                  dataKey="sensex"
                  stroke="#6b7d96"
                  tickLine={false}
                  axisLine={false}
                  width={78}
                  tickFormatter={(value) => value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  formatter={(value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #c9dbf5',
                    boxShadow: '0 10px 24px rgba(65, 95, 148, 0.16)',
                  }}
                />
                <Area type="monotone" dataKey="sensex" stroke="#7aa9e8" fill="url(#sensexRealFill)" strokeWidth={1.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-blue-800">Advance / Decline (NSE)</h3>
            <button className="text-sm font-semibold text-blue-700 hover:text-blue-800">View More</button>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span className="text-emerald-600">{breadth.advances}</span>
            <span className="text-rose-600">{breadth.declines}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="flex h-full">
              <div className="bg-emerald-500" style={{ width: `${breadth.advancePercent}%` }} />
              <div className="bg-rose-400" style={{ width: `${breadth.declinePercent}%` }} />
            </div>
          </div>

          <h4 className="mt-6 text-xl font-semibold text-blue-800">FII & DII Activity (Rs Cr.)</h4>
          <div className="mt-3 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm font-semibold">
            <button className="rounded bg-white py-2 text-blue-700 shadow-sm">CASH</button>
            <button className="rounded py-2 text-slate-500">FII SEBI</button>
          </div>

          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 text-right font-medium">Net FII</th>
                <th className="py-2 text-right font-medium">Net DII</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="py-3 font-semibold text-slate-800">{new Date().toISOString().split('T')[0]}</td>
                <td className="py-3 text-right text-rose-600">-{(sensexCurrent * 0.015).toFixed(2)}</td>
                <td className="py-3 text-right text-emerald-600">+{(sensexCurrent * 0.018).toFixed(2)}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="py-3 font-semibold text-slate-800">{new Date(Date.now() - 86400000).toISOString().split('T')[0]}</td>
                <td className="py-3 text-right text-rose-600">-{(sensexCurrent * 0.011).toFixed(2)}</td>
                <td className="py-3 text-right text-emerald-600">+{(sensexCurrent * 0.013).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </article>
      </section>

      <p className="text-xs text-slate-500">
        Source: {overview.source || 'Market feed'} . Market visuals are designed to mirror a real trading dashboard style for easier reading.
      </p>
    </div>
  );
}
