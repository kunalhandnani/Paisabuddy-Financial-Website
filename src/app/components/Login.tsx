import { useState } from 'react';
import { ArrowRight, Landmark } from 'lucide-react';

interface LoginProps {
  onLogin: (name: string, email: string) => Promise<void>;
  onRegister: (name: string, email: string) => Promise<void>;
  isLoading: boolean;
  error: string;
  successMessage: string;
}

type AuthMode = 'login' | 'signup';

export function Login({ onLogin, onRegister, isLoading, error, successMessage }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !email) {
      return;
    }

    if (mode === 'signup') {
      await onRegister(name, email);
      return;
    }

    await onLogin(name, email);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d1fae5_0%,#f8fafc_45%,#eef2ff_100%)] p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-2xl shadow-emerald-100 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-emerald-700 p-8 text-white md:p-12">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Landmark size={28} />
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-100">PaisaBuddy</p>
            <h1 className="max-w-md text-4xl font-semibold tracking-tight md:text-5xl">
              Smarter money decisions in one simple workspace.
            </h1>
            <p className="max-w-lg text-base text-emerald-50/90">
              Track investments, monitor live market moves, and keep your portfolio view easy to understand.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-emerald-50/90 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">Live stock overview</div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">Investment tracking</div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">Simple SIP planning</div>
          </div>
        </section>

        <section className="p-8 md:p-12">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-emerald-700">Welcome</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {mode === 'login' ? 'Login to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Register once with your name and a valid email, then log in any time using the same details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    mode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    mode === 'signup' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Signup
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Aman Sharma"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="aman@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                required
              />
            </div>

            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}
            {successMessage ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p> : null}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : mode === 'login' ? 'Login' : 'Signup'}
              <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
