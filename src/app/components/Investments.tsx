import { useEffect, useState } from 'react';
import { Plus, WalletCards } from 'lucide-react';
import { api } from '../lib/api';
import { formatCurrency, formatPercent } from '../lib/format';
import type { Investment, InvestmentOption, User } from '../types';

interface InvestmentsProps {
  user: User;
}

interface InvestmentsResponse {
  recommendedOptions: InvestmentOption[];
  activeInvestments: Investment[];
  allInvestments: Investment[];
}

const initialForm = {
  name: '',
  category: '',
  amount: '',
  currentValue: '',
  riskLevel: 'Medium',
  status: 'active',
  notes: '',
  startedOn: '',
};

export function Investments({ user }: InvestmentsProps) {
  const [data, setData] = useState<InvestmentsResponse>({
    recommendedOptions: [],
    activeInvestments: [],
    allInvestments: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadInvestments() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<InvestmentsResponse>(`/investments?userId=${user.id}`);
      setData(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load investments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInvestments();
  }, [user.id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/investments', {
        userId: user.id,
        name: form.name,
        category: form.category,
        amount: Number(form.amount),
        currentValue: Number(form.currentValue || form.amount),
        riskLevel: form.riskLevel,
        status: form.status,
        notes: form.notes,
        startedOn: form.startedOn || undefined,
      });

      setForm(initialForm);
      setShowForm(false);
      await loadInvestments();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save investment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <WalletCards size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Investments</h2>
                <p className="mt-1 text-sm text-slate-500">Recommended ideas plus the holdings you add yourself.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            + Investments
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-[24px] border border-emerald-100 bg-emerald-50/60 p-5 md:grid-cols-2">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Investment name"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              required
            />
            <input
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Category"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              required
            />
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Amount invested"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
              required
            />
            <input
              type="number"
              min="0"
              value={form.currentValue}
              onChange={(event) => setForm((current) => ({ ...current, currentValue: event.target.value }))}
              placeholder="Current value"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
            />
            <select
              value={form.riskLevel}
              onChange={(event) => setForm((current) => ({ ...current, riskLevel: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
            >
              <option value="Low">Low risk</option>
              <option value="Medium">Medium risk</option>
              <option value="High">High risk</option>
            </select>
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
            <input
              type="date"
              value={form.startedOn}
              onChange={(event) => setForm((current) => ({ ...current, startedOn: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
            />
            <input
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Notes"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500"
            />

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting ? 'Saving...' : 'Save investment'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Active investments</h3>
            <p className="mt-1 text-sm text-slate-500">Your currently active holdings are always visible here.</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {data.activeInvestments.length} active
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Loading your active investments...
            </div>
          ) : data.activeInvestments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              No active investments yet. Use the + Investments button to add one.
            </div>
          ) : (
            data.activeInvestments.map((investment) => (
              <article key={investment.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">{investment.name}</h4>
                    <p className="mt-1 text-sm text-slate-500">{investment.category}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    {investment.riskLevel}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <p className="text-slate-500">Invested</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatCurrency(investment.amount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                    <p className="text-slate-500">Current value</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatCurrency(investment.currentValue)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Performance</p>
                  <p className={`text-sm font-semibold ${investment.gainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(investment.gainLoss)} ({formatPercent(investment.gainLossPercent)})
                  </p>
                </div>

                {investment.notes ? <p className="mt-4 text-sm text-slate-500">{investment.notes}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="text-2xl font-semibold text-slate-900">Suggested investment options</h3>
        <p className="mt-1 text-sm text-slate-500">These stay simple and educational while your own investments remain separate above.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.recommendedOptions.map((option) => (
            <article key={option.name} className="rounded-[24px] border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-lg font-semibold text-slate-900">{option.name}</h4>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{option.category}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{option.description}</p>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Expected return</span>
                  <span className="font-medium text-slate-900">{option.expectedReturns}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Minimum amount</span>
                  <span className="font-medium text-slate-900">{option.minimumInvestment}</span>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {option.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {highlight}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
