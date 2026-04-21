import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { paymentsService } from '../services'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CreditCard, Plus, X, Loader2, RefreshCw, Undo2 } from 'lucide-react'
import toast from 'react-hot-toast'

const StatusBadge = ({ s }) => {
  const map = { completed: 'badge-free', pending: 'badge-reserved', failed: 'badge-cancelled', refunded: 'badge-completed' }
  return <span className={map[s] || 'badge-completed'}><span className="w-1.5 h-1.5 rounded-full bg-current" />{s}</span>
}

const METHOD_ICON = { card: '💳', cash: '💵', transfer: '🏦', online: '🌐' }

export default function PaymentsPage() {
  const { user } = useSelector(s => s.auth)
  const isAdmin = user?.role === 'admin'
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ amount: '', method: 'card', reservationId: '', transactionRef: '' })

  const load = async () => {
    try {
      setLoading(true)
      const res = await paymentsService.getAll({ limit: 50, status: filterStatus || undefined })
      setPayments(res.data.data.payments)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const handleCreate = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await paymentsService.create({ ...form, amount: parseFloat(form.amount), reservationId: form.reservationId ? parseInt(form.reservationId) : undefined })
      toast.success('Paiement enregistré !')
      setShowModal(false)
      setForm({ amount: '', method: 'card', reservationId: '', transactionRef: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }

  const handleRefund = async id => {
    if (!confirm('Rembourser ce paiement ?')) return
    try {
      await paymentsService.refund(id)
      toast.success('Remboursement effectué')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const total = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + parseFloat(p.amount || 0), 0)

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Paiements</h1>
          <p className="text-slate-500 text-sm mt-0.5">{payments.length} transaction(s) · <span className="text-emerald-400 font-semibold font-mono">{total.toFixed(2)} MAD</span> total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm"><RefreshCw size={14} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm"><Plus size={15} />Enregistrer</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'completed', 'pending', 'failed', 'refunded'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'border-white/5 text-slate-500 hover:text-white'}`}>
            {s || 'Tous'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-400" size={28} /></div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-16 text-slate-500">Aucun paiement</div>
      ) : (
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.id} className="card-hover flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                {METHOD_ICON[p.method] || '💳'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-white font-mono">{parseFloat(p.amount).toFixed(2)} MAD</span>
                  <StatusBadge s={p.status} />
                  <span className="text-xs text-slate-500 capitalize">{p.method}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3">
                  {isAdmin && p.user && <span>👤 {p.user.name}</span>}
                  {p.transactionRef && <span className="font-mono">#{p.transactionRef}</span>}
                  <span>{p.date ? format(new Date(p.date), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}</span>
                  {p.reservationId && <span>Résa #{p.reservationId}</span>}
                </div>
              </div>
              {p.status === 'completed' && isAdmin && (
                <button onClick={() => handleRefund(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-all shrink-0">
                  <Undo2 size={12} /> Rembourser
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white text-lg">Enregistrer un paiement</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Montant (MAD) *</label>
                  <input className="input" type="number" min="0.01" step="0.01" placeholder="50.00"
                    value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Méthode *</label>
                  <select className="input" value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                    {['card', 'cash', 'transfer', 'online'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">ID Réservation (optionnel)</label>
                <input className="input" type="number" placeholder="1" value={form.reservationId}
                  onChange={e => setForm(p => ({ ...p, reservationId: e.target.value }))} />
              </div>
              <div>
                <label className="label">Référence transaction</label>
                <input className="input" placeholder="REF-001" value={form.transactionRef}
                  onChange={e => setForm(p => ({ ...p, transactionRef: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving && <Loader2 size={15} className="animate-spin" />} Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
