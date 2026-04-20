import { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/format';

export function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  function calculateSIP() {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = timePeriod * 12;

    const futureValue = monthlyInvestment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalInvestment = monthlyInvestment * months;
    const estimatedReturns = futureValue - totalInvestment;

    return {
      futureValue: Math.round(futureValue),
      totalInvestment: Math.round(totalInvestment),
      estimatedReturns: Math.round(estimatedReturns),
    };
  }

  const results = calculateSIP();
  const investedShare = (results.totalInvestment / results.futureValue) * 100;
  const returnsShare = (results.estimatedReturns / results.futureValue) * 100;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">SIP Calculator</h2>
            <p className="mt-1 text-sm text-slate-500">Play with the inputs and instantly compare invested amount versus future value.</p>
          </div>
        </div>

        <div className="mt-8 space-y-8">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Monthly investment</span>
              <span>{formatCurrency(monthlyInvestment)}</span>
            </label>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment}
              onChange={(event) => setMonthlyInvestment(Number(event.target.value))}
              className="mt-4 w-full accent-emerald-600"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Expected return</span>
              <span>{expectedReturn}% p.a.</span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturn}
              onChange={(event) => setExpectedReturn(Number(event.target.value))}
              className="mt-4 w-full accent-emerald-600"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>Time period</span>
              <span>{timePeriod} years</span>
            </label>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={timePeriod}
              onChange={(event) => setTimePeriod(Number(event.target.value))}
              className="mt-4 w-full accent-emerald-600"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Projection</h3>
            <p className="mt-1 text-sm text-slate-500">A quick estimate based on your current SIP assumptions.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Total invested</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{formatCurrency(results.totalInvestment)}</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Estimated returns</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-600">{formatCurrency(results.estimatedReturns)}</p>
          </div>
          <div className="rounded-[24px] bg-emerald-600 p-5 text-white">
            <p className="text-sm text-emerald-50">Future value</p>
            <p className="mt-3 text-2xl font-semibold">{formatCurrency(results.futureValue)}</p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Invested amount share</span>
              <span className="font-medium text-slate-900">{investedShare.toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-slate-900" style={{ width: `${investedShare}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Returns share</span>
              <span className="font-medium text-emerald-700">{returnsShare.toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${returnsShare}%` }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
