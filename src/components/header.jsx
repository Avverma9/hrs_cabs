import { LogOut } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../redux/slices/authSlice'

const META = {
  '/': { title: 'Explore', sub: 'Find your perfect ride' },
  '/my-cars': { title: 'My Fleet', sub: 'Manage your vehicles' },
  '/my-bookings': { title: 'Bookings', sub: 'Track reservations' },
  '/profile': { title: 'Account', sub: 'Your profile' },
}

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useSelector((s) => s.auth.user)

  const meta = META[pathname] || { title: 'Cab App', sub: '' }
  const initials = (user?.name || user?.email || 'G').charAt(0).toUpperCase()

  function handleLogout() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            Cab Manager
          </span>
          <h1 className="text-xl font-black text-gray-900 leading-none">{meta.title}</h1>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-gray-100 hover:bg-red-50 active:scale-95 transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-black">
            {initials}
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 max-w-[5rem] truncate hidden sm:block">
            {user?.name || user?.email || 'User'}
          </span>
          <LogOut size={13} className="text-gray-400 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </header>
  )
}
