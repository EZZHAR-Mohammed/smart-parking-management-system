import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import {
  LayoutDashboard, ParkingSquare, CalendarClock, CreditCard,
  Users, User, LogOut, Menu, X, BadgeCheck, Bell
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/spots',         icon: ParkingSquare,   label: 'Places' },
  { to: '/reservations',  icon: CalendarClock,   label: 'Réservations' },
  { to: '/subscriptions', icon: BadgeCheck,      label: 'Abonnements' },
  { to: '/payments',      icon: CreditCard,      label: 'Paiements' },
  { to: '/profile',       icon: User,            label: 'Profil' },
]

const adminItems = [
  { to: '/users', icon: Users, label: 'Utilisateurs' },
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const allItems = user?.role === 'admin'
    ? [...navItems, ...adminItems]
    : navItems.filter(item => item.to !== '/dashboard')

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
            <ParkingSquare size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">SmartPark</div>
            <div className="text-xs text-slate-500 mt-0.5">Management System</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {allItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 font-medium
              ${isActive
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/3">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full text-sm text-slate-400">
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/5 bg-surface-950 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-60 bg-surface-950 border-r border-white/5 flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-surface-950">
          <button onClick={() => setOpen(true)} className="btn-ghost p-2"><Menu size={20} /></button>
          <span className="font-display font-bold text-white">SmartPark</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
