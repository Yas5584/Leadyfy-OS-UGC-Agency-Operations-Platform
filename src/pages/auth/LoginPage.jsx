import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Film, Video, PenTool, Camera, Sparkles, Loader2, ArrowRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'OWNER',
    name: 'Rajesh Kumar',
    email: 'owner@leadyfy.demo',
    password: 'Demo@123',
    icon: ShieldCheck,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Full agency operations, financials & payouts'
  },
  {
    role: 'ADMIN',
    name: 'Priya Sharma',
    email: 'admin@leadyfy.demo',
    password: 'Demo@123',
    icon: UserCheck,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Pipeline & team task management'
  },
  {
    role: 'SCRIPT_WRITER',
    name: 'Ankit Verma',
    email: 'writer@leadyfy.demo',
    password: 'Demo@123',
    icon: PenTool,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Script drafts & client revisions'
  },
  {
    role: 'SHOOT_MANAGER',
    name: 'Vikram Singh',
    email: 'shoot@leadyfy.demo',
    password: 'Demo@123',
    icon: Camera,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Shoot schedule & creator logistics'
  },
  {
    role: 'EDITOR',
    name: 'Sneha Patel',
    email: 'editor@leadyfy.demo',
    password: 'Demo@123',
    icon: Video,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Production Kanban & rough cuts'
  },
  {
    role: 'CLIENT',
    name: 'Arjun Mehta (Acme Fitness)',
    email: 'client@acme.demo',
    password: 'Demo@123',
    icon: Film,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Isolated client portal & approvals'
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('owner@leadyfy.demo');
  const [password, setPassword] = useState('Demo@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res?.user?.role === 'CLIENT') {
        navigate('/portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Invalid email or password. Please verify server is running.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-white font-black text-xl shadow-md shadow-amber-500/20 mb-3">
          LO
        </div>
        <h2 className="text-3xl font-extrabold text-[#111111] tracking-tight">
          LEADYFY <span className="text-amber-500 font-black">OS</span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Internal UGC & Digital Marketing Agency Operations System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="name@leadyfy.demo"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-md shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In to Workspace <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Demo Accounts (Click to autofill)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => selectDemoAccount(acc)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                        {acc.role}
                      </span>
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="text-xs font-semibold text-gray-900">{acc.name}</div>
                    <div className="text-[11px] text-gray-500 font-mono">{acc.email}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{acc.description}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-center text-xs text-gray-400">
              Password for all demo accounts: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-800">Demo@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
