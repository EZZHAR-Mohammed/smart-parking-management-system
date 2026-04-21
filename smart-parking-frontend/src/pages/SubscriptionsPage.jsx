import React, { useEffect, useState } from 'react'
import { subscriptionsService } from '../services'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BadgeCheck, Plus, X, Loader2, RefreshCw, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const StatusBadge = ({ s }) => {
  const cls = { active: 'badge-active', expired: 'badge-completed', cancelled: 'badge-cancelled' }
  return <span className={cls[s] || 'badge-completed'}><span className="w-1.5 h-1.5 rounded-full bg-current" />{s}</span>
}

const PLANS = [
  { type: 'monthly', label: 'Mensuel', price: 150, desc: '1 mois · accès illimité', color: 'border-primary-500/30 bg-primary-500/5' },
  { type: 'annual',  label: 'Annuel',  price: 1500, desc: '12 mois · économisez 300 MAD', color: 'border-amber-500/30 bg-amber-500/5' },
]

export default function SubscriptionsPage() {
  const { user } = useSelector(s => s.auth)
  const isAdmin = user?.role === 'admin'
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await subscriptionsService.getAll({ limit: 50 })
      setSubs(res.data.data.subscriptions)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await subscriptionsService.create({ type: selectedPlan })
      toast.success('Abonnement créé !')
      setShowModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }

  const handleRenew = async id => {
    try {
      await subscriptionsService.renew(id)
      toast.success('Abonnement renouvelé !')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const handleCancel = async id => {
    if (!confirm('Annuler cet abonnement ?')) return
    try {
      await subscriptionsService.update(id, { status: 'cancelled' })
      toast.success('Abonnement annulé')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Abonnements</h1>
          <p className="text-slate-500 text-sm mt-0.5">{subs.filter(s => s.status === 'active').length} actif(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm"><RefreshCw size={14} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm"><Plus size={15} />Souscrire</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-400" size={28} /></div>
      ) : subs.length === 0 ? (
        <div className="card text-center py-16">
          <BadgeCheck size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500">Aucun abonnement</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mx-auto mt-4 text-sm"><Plus size={15} />Souscrire maintenant</button>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map(s => {
            const isActive = s.status === 'active'
            const daysLeft = s.endDate ? Math.ceil((new Date(s.endDate) - new Date()) / 86400000) : 0
            return (
              <div key={s.id} className={`card-hover flex flex-col sm:flex-row sm:items-center gap-4 ${isActive ? 'border-primary-500/20' : ''}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.type === 'annual' ? 'bg-amber-500/10' : 'bg-primary-500/10'}`}>
                  <BadgeCheck size={20} className={s.type === 'annual' ? 'text-amber-400' : 'text-primary-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-white capitalize">{s.type === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
                    <StatusBadge s={s.status} />
                    {isActive && daysLeft <= 7 && daysLeft >= 0 && (
                      <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                        ⚠ Expire dans {daysLeft}j
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4">
                    {isAdmin && s.user && <span>👤 {s.user.name}</span>}
                    <span>Du {s.startDate ? format(new Date(s.startDate), 'dd MMM yyyy', { locale: fr }) : '—'}</span>
                    <span>au {s.endDate ? format(new Date(s.endDate), 'dd MMM yyyy', { locale: fr }) : '—'}</span>
                    <span className="font-mono text-white font-semibold">{s.price} MAD</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {isActive && (
                    <button onClick={() => handleRenew(s.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-xs font-semibold border border-primary-500/20 transition-all">
                      <RotateCcw size={12} /> Renouveler
                    </button>
                  )}
                  {isActive && isAdmin && (
                    <button onClick={() => handleCancel(s.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all">
                      <X size={12} /> Annuler
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white text-lg">Choisir un plan</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-3">
                {PLANS.map(plan => (
                  <label key={plan.type} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedPlan === plan.type ? plan.color : 'border-white/5 bg-white/2 hover:border-white/10'}`}>
                    <input type="radio" name="plan" value={plan.type} checked={selectedPlan === plan.type}
                      onChange={() => setSelectedPlan(plan.type)} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === plan.type ? 'border-primary-400' : 'border-white/20'}`}>
                      {selectedPlan === plan.type && <div className="w-2 h-2 rounded-full bg-primary-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{plan.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{plan.desc}</div>
                    </div>
                    <div className="font-display font-bold text-white text-lg">{plan.price} <span className="text-xs text-slate-400">MAD</span></div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving && <Loader2 size={15} className="animate-spin" />} Souscrire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
