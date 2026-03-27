import { createElement } from 'react'
import { CarFront, CircleUserRound, House, NotebookTabs } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/my-cars', label: 'Cars', icon: CarFront },
  { to: '/my-bookings', label: 'Bookings', icon: NotebookTabs },
  { to: '/profile', label: 'Profile', icon: CircleUserRound },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {createElement(item.icon, { size: 19 })}
            <span className="text-[9px] font-black uppercase tracking-wider leading-none">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
