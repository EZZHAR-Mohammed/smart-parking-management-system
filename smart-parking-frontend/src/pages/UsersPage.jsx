import React, { useEffect, useState } from 'react'
import { usersService } from '../services'
import { Users, Search, RefreshCw, Loader2, ShieldCheck, User, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await usersService.getAll({ limit: 50, search: search || undefined, role: filterRole || undefined })
      setUsers(res.data.data.users)
      setTotal(res.data.data.total)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterRole])
  useEffect(() => {
    const t = setTimeout(() => load(), 400)
    return () => clearTimeout(t)
  }, [search])

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Désactiver ${name} ?`)) return
    try {
      await usersService.delete(id)
      toast.success('Utilisateur désactivé')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} utilisateur(s)</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm"><RefreshCw size={14} /> Actualiser</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-10 text-sm" placeholder="Rechercher nom ou email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['', 'user', 'admin'].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${filterRole === r ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'border-white/5 text-slate-500 hover:text-white'}`}>
              {r || 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-400" size={28} /></div>
      ) : users.length === 0 ? (
        <div className="card text-center py-16 text-slate-500">Aucun utilisateur</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className={`card-hover flex flex-col sm:flex-row sm:items-center gap-3 ${!u.isActive ? 'opacity-50' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-primary-500/10 text-primary-400'}`}>
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{u.name}</span>
                  {u.role === 'admin'
                    ? <span className="badge-reserved"><ShieldCheck size={11} />admin</span>
                    : <span className="badge-completed"><User size={11} />user</span>
                  }
                  {!u.isActive && <span className="text-xs text-red-400 font-semibold">désactivé</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3">
                  <span>{u.email}</span>
                  {u.phone && <span>{u.phone}</span>}
                  <span>Inscrit le {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy', { locale: fr }) : '—'}</span>
                </div>
              </div>
              {u.isActive && (
                <button onClick={() => handleDeactivate(u.id, u.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all shrink-0">
                  <UserX size={13} /> Désactiver
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
