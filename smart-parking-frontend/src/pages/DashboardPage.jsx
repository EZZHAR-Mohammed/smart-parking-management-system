import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { dashboardService } from '../services'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, ParkingSquare, CalendarClock, BadgeCheck, TrendingUp, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444', '#6366f1']

export default function DashboardPage() {
  const { user } = useSelector(s => s.auth)
  const [stats, setStats] = useState(null)
  const [occupancy, setOccupancy] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const [s, o, r] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getOccupancy(),
        dashboardService.getRevenue('monthly'),
      ])
      setStats(s.data.data)
      setOccupancy(o.data.data)
      setRevenue(r.data.data.revenue || [])
    } catch {
      toast.error('Erreur chargement dashboard')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="animate-spin text-primary-400" size={28} />
    </div>
  )

  const statCards = [
    { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Places totales', value: stats?.totalSpots || 0, icon: ParkingSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Réservations actives', value: stats?.activeReservations || 0, icon: CalendarClock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Abonnements actifs', value: stats?.activeSubscriptions || 0, icon: BadgeCheck, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  ]

  const pieData = occupancy?.byType
    ? Object.entries(
        occupancy.byType.reduce((acc, { type, status, count }) => {
          if (!acc[type]) acc[type] = 0
          acc[type] += parseInt(count)
          return acc
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : []

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Vue d'ensemble du parking</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card-hover">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="font-display text-3xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      {occupancy && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white text-base">Occupation en temps réel</h2>
            <span className="font-mono text-2xl font-bold text-primary-400">{occupancy.occupancyRate}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
              style={{ width: `${occupancy.occupancyRate}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{occupancy.free} libres</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{occupancy.occupied} occupées</span>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-primary-400" />
            <h2 className="font-display font-bold text-white text-base">Revenus mensuels</h2>
          </div>
          {revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v ? new Date(v).toLocaleDateString('fr', { month: 'short' }) : ''} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${parseFloat(v).toFixed(2)} MAD`, 'Revenu']}
                  labelFormatter={v => v ? new Date(v).toLocaleDateString('fr', { month: 'long', year: 'numeric' }) : v}
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                  labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#0ea5e9' }} />
                <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-600 text-sm">Aucune donnée de revenus</div>
          )}
        </div>

        {/* Pie chart by type */}
        <div className="card">
          <h2 className="font-display font-bold text-white text-base mb-5">Par type de place</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
                    itemStyle={{ color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {pieData.map(({ name, value }, i) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-400 capitalize">{name}</span>
                    </div>
                    <span className="font-mono text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-600 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Spot stats quick */}
      {stats?.spotStats && (
        <div className="card">
          <h2 className="font-display font-bold text-white text-base mb-4">Statut des places</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.spotStats.map(({ status, count }) => (
              <div key={status} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <div className="font-display text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-slate-500 capitalize mt-0.5">{status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
