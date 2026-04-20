import { useEffect, useState } from 'react';
import { ArrowUpRight, CircleDollarSign, Layers3, Wallet2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatCurrency, formatPercent } from '../lib/format';
import type { DashboardSummary, User } from '../types';

interface DashboardProps {
  user: User;
}

const emptySummary: DashboardSummary = {
  totalInvested: 0,
  totalCurrentValue: 0,
  totalReturns: 0,
  activeInvestments: 0,
  returnPercentage: 0,
  topHoldings: [],
};

export function Dashboard({ user }: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get<DashboardSummary>(`/dashboard/${user.id}`)
      .then((response) => {
        if (isMounted) {
          setSummary(response);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSummary(emptySummary);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const cards = [
    {
      title: 'Total invested',
      value: formatCurrency(summary.totalInvested),
      description: 'Capital currently deployed',
      icon: Wallet2,
      accent: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Current value',
      value: formatCurrency(summary.totalCurrentValue),
      description: 'Latest portfolio snapshot',
      icon: CircleDollarSign,
      accent: 'bg-sky-50 text-sky-700',
    },
    {
      title: 'Unrealized return',
      value: formatCurrency(summary.totalReturns),
      description: formatPercent(summary.returnPercentage),
      icon: ArrowUpRight,
      accent: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Active investments',
      value: String(summary.activeInvestments),
      description: 'Visible in the investments tab',
      icon: Layers3,
      accent: 'bg-violet-50 text-violet-700',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-700">Overview</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Welcome back, {user.name}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Your dashboard now runs on a Node.js, Express, and MongoDB backend, so your investment entries persist across sessions.
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {loading ? 'Refreshing portfolio summary...' : 'Portfolio summary is synced from the backend.'}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, description, icon: Icon, accent }) => (
          <article key={title} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`inline-flex rounded-2xl p-3 ${accent}`}>
              <Icon size={20} />
            </div>
            <p className="mt-5 text-sm text-slate-500">{title}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Portfolio highlights</h3>
              <p className="mt-1 text-sm text-slate-500">Your strongest active holdings appear here.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Top 3</span>
          </div>

          <div className="mt-6 space-y-4">
            {summary.topHoldings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                Add your first investment in the Investments tab to see active holdings here.
              </div>
            ) : (
              summary.topHoldings.map((holding) => (
                <div key={holding.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{holding.name}</p>
                    <p className="text-sm text-slate-500">{holding.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(holding.currentValue)}</p>
                    <p className={`text-sm ${holding.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatPercent(holding.changePercent)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Simple action plan</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">1. Add real holdings</p>
              <p className="mt-1 text-sm text-slate-500">Use the + Investments button to store your active positions in MongoDB.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">2. Check market pulse</p>
              <p className="mt-1 text-sm text-slate-500">The stock market tab now pulls current-day prices at runtime.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">3. Compare performance</p>
              <p className="mt-1 text-sm text-slate-500">Track invested amount versus current value to spot underperformers quickly.</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
