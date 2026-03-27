import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearAuthError, loginUser } from '../redux/slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user, navigate])
  useEffect(() => () => { dispatch(clearAuthError()) }, [dispatch])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) return
    const res = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(res)) navigate('/', { replace: true })
  }

  const FEATURES = ['Live Tracking', 'Instant Booking', 'Fleet Analytics', 'Smart Routing']

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex w-[45%] relative flex-col justify-between p-14 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/8 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-xl">🚗</span>
          </div>
          <span className="text-white font-black text-xl tracking-tight">Cab Manager</span>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
            Manage your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              fleet with ease.
            </span>
          </h2>
          <p className="text-zinc-400 font-semibold text-lg leading-relaxed mb-8">
            Book rides, track drivers, and handle all your<br />operations from one powerful dashboard.
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/8 border border-white/10 rounded-full text-xs font-bold text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-6">
          {[['500+', 'Vehicles'], ['10K+', 'Bookings'], ['99%', 'Uptime']].map(([num, lab]) => (
            <div key={lab}>
              <div className="text-2xl font-black text-white">{num}</div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{lab}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <div className="w-14 h-14 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <span className="text-2xl">🚗</span>
            </div>
            <h2 className="text-2xl font-black text-white">Cab Manager</h2>
          </div>

          <div className="mb-9">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Welcome back</p>
            <h2 className="text-4xl font-black text-white leading-tight mb-2">Sign in</h2>
            <p className="text-zinc-500 font-semibold text-sm">Access your fleet management dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="driver@cab.com"
                autoComplete="email"
                className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-2xl px-5 py-4 font-semibold text-sm outline-none
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-zinc-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-zinc-900 text-white border border-zinc-800 rounded-2xl px-5 py-4 font-semibold text-sm outline-none
                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-zinc-600 transition-all pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-950/50 border border-red-800/40 text-red-400 rounded-2xl px-4 py-3.5 text-sm font-semibold">
                <span className="mt-0.5 text-base">⚠</span>
                <span>{String(error)}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-zinc-950 font-black py-4 rounded-2xl hover:bg-zinc-100 active:scale-[0.98]
                transition-all disabled:opacity-40 text-sm tracking-wide shadow-2xl shadow-white/5 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin inline-block"></span>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
