import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../redux/slices/authSlice'
import { getAllCars } from '../redux/slices/carSlice'
import { getAllBookings } from '../redux/slices/bookingSlice'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const carCount = useSelector((s) => s.cars.cars.length)
  const bookingCount = useSelector((s) => s.bookings.bookings.length)

  useEffect(() => {
    dispatch(getAllCars())
    dispatch(getAllBookings())
  }, [dispatch])

  function handleLogout() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

  const stats = [
    { label: 'Cars Loaded', value: carCount, icon: '🚗', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Bookings', value: bookingCount, icon: '📋', color: 'bg-violet-50 text-violet-600 border-violet-100' },
    { label: 'Role', value: user?.role || 'user', icon: '🏷️', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Status', value: 'Active', icon: '✅', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  ]

  const fields = [
    { label: 'Full Name', value: user?.name || '—' },
    { label: 'Email Address', value: user?.email || '—' },
    { label: 'User ID', value: user?.id || user?._id || '—' },
    { label: 'Mobile', value: user?.mobile || user?.phone || '—' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 right-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-8 w-32 h-32 bg-violet-500/15 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white text-zinc-900 text-3xl font-black flex items-center justify-center mx-auto mb-4 shadow-2xl border-4 border-white/10">
            {initial}
          </div>
          <h2 className="text-2xl font-black text-white">{user?.name || 'Cab User'}</h2>
          <p className="text-zinc-400 font-semibold text-sm mt-1">{user?.email || '—'}</p>
          <span className="mt-3 inline-flex px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-black text-white/80 uppercase tracking-widest">
            {user?.role || 'user'}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-10 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map((s) => (
            <div key={s.label} className={`bg-white rounded-3xl p-5 shadow-sm border ${s.color.split(' ')[2] || 'border-gray-100'}`}>
              <div className={`w-10 h-10 ${s.color.split(' ').slice(0, 2).join(' ')} bg-opacity-80 rounded-2xl flex items-center justify-center text-xl mb-3 border ${s.color.split(' ')[2] || ''}`}>
                {s.icon}
              </div>
              <div className="text-2xl font-black text-gray-900">{s.value}</div>
              <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <span className="text-base">👤</span>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Account Details</h3>
          </div>
          {fields.map((f, i) => (
            <div
              key={f.label}
              className={`px-5 py-4 flex justify-between items-center ${i !== fields.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0 mr-4">{f.label}</span>
              <span className="text-sm font-bold text-gray-900 truncate text-right max-w-[55%]">{f.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-black py-4 rounded-3xl hover:bg-red-600 active:scale-[0.98]
            transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  )
}
