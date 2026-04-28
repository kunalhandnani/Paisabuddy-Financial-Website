import { useEffect, useState } from 'react';
import { Calculator, Home, LogOut, TrendingUp, Wallet } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Investments } from './components/Investments';
import { Login } from './components/Login';
import { SIPCalculator } from './components/SIPCalculator';
import { StockMarket } from './components/StockMarket';
import type { User } from './types';

type Tab = 'home' | 'sip' | 'investments' | 'stocks';

const tabs: Array<{ id: Tab; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'sip', label: 'SIP Calculator', icon: Calculator },
  { id: 'investments', label: 'Investments', icon: Wallet },
  { id: 'stocks', label: 'Stock Market', icon: TrendingUp },
];

const storageKey = 'paisabuddy_user';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  function handleEnterSite(name: string, email: string) {
    const localUser = {
      id: email.trim().toLowerCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
    };

    setUser(localUser);
    window.localStorage.setItem(storageKey, JSON.stringify(localUser));
  }

  function handleLogout() {
    setUser(null);
    setActiveTab('home');
    window.localStorage.removeItem(storageKey);
  }

  if (!user) {
    return <Login onEnter={handleEnterSite} />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faf7_0%,#edf5ef_100%)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <Wallet size={22} />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">PaisaBuddy</p>
                <p className="text-sm text-slate-500">Simple investing guidance for everyday users</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeTab === id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <p className="text-sm text-slate-600">
                Signed in as <span className="font-semibold text-slate-900">{user.name}</span>
              </p>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {activeTab === 'home' && <Dashboard user={user} />}
        {activeTab === 'sip' && <SIPCalculator />}
        {activeTab === 'investments' && <Investments user={user} />}
        {activeTab === 'stocks' && <StockMarket />}
      </main>
    </div>
  );
}
