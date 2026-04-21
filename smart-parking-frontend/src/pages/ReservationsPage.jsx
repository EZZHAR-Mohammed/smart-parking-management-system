import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { reservationsService, spotsService } from '../services'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarClock, Plus, X, Loader2, StopCircle, Ban, RefreshCw, Car } from 'lucide-react'
import toast from 'react-hot-toast'

const StatusBadge = ({ s }) => {
  const cls = { active: 'badge-active', completed: 'badge-completed', cancelled: 'badge-cancelled' }
  return <span className={cls[s] || 'badge-completed'}><span className="w-1.5 h-1.5 rounded-full bg-current" />{s}</span>
}

export default function ReservationsPage() {
  const { user } = useSelector(s => s.auth)
  const isAdmin = user?.role === 'admin'

  const [reservations, setReservations] = useState([])
  const [freeSpots, setFreeSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({ spotId: '', startTime: '', endTime: '', vehiclePlate: '', notes: '' })

  const load = async () => {
    try {
      setLoading(true)
      const [r, s] = await Promise.all([
        reservationsService.getAll({ limit: 50, status: filterStatus || undefined }),
        spotsService.getAll({ status: 'free' }),
      ])
      setReservations(r.data.data.reservations)
      setFreeSpots(s.data.data.spots)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterStatus])

  const handleCreate = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await reservationsService.create({ ...form, spotId: parseInt(form.spotId) })
      toast.success('Réservation créée !')
      setShowModal(false)
      setForm({ spotId: '', startTime: '', endTime: '', vehiclePlate: '', notes: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSaving(false) }
  }

  const handleEnd = async id => {
    if (!confirm('Terminer cette réservation et libérer la place ?')) return
    try {
      const res = await reservationsService.end(id)
      toast.success(`Terminée — ${res.data.data.totalAmount} MAD`)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const handleCancel = async id => {
    if (!confirm('Annuler cette réservation ?')) return
    try {
      await reservationsService.cancel(id)
      toast.success('Réservation annulée')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
  }

  const now = new Date().toISOString().slice(0, 16)

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Réservations</h1>
          <p className="text-slate-500 text-sm mt-0.5">{reservations.length} réservation(s)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm"><RefreshCw size={14} /></button>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm"><Plus size={15} />Réserver</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'active', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'border-white/5 text-slate-500 hover:text-white'}`}>
            {s || 'Toutes'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-400" size={28} /></div>
      ) : reservations.length === 0 ? (
        <div className="card text-center py-16 text-slate-500">Aucune réservation</div>
      ) : (
        <div className="space-y-2">
          {reservations.map(r => (
            <div key={r.id} className="card-hover flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <Car size={18} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-white text-sm">
                    Place {r.spot?.number || r.spotId}
                  </span>
                  {r.vehiclePlate && <span className="font-mono text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded">{r.vehiclePlate}</span>}
                  <StatusBadge s={r.status} />
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  {isAdmin && r.user && <span>👤 {r.user.name}</span>}
                  <span>🕐 {r.startTime ? format(new Date(r.startTime), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}</span>
                  {r.endTime && <span>→ {format(new Date(r.endTime), 'dd MMM yyyy HH:mm', { locale: fr })}</span>}
                  {r.totalAmount && <span className="text-emerald-400 font-semibold font-mono">{r.totalAmount} MAD</span>}
                </div>
              </div>
              {r.status === 'active' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEnd(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all">
                    <StopCircle size={13} /> Terminer
                  </button>
                  <button onClick={() => handleCancel(r.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-all">
                    <Ban size={13} /> Annuler
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white text-lg">Nouvelle réservation</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Place *</label>
                <select className="input" value={form.spotId} onChange={e => setForm(p => ({ ...p, spotId: e.target.value }))} required>
                  <option value="">Choisir une place libre</option>
                  {freeSpots.map(s => (
                    <option key={s.id} value={s.id}>{s.number} — {s.type} ({s.floor}) — {s.pricePerHour} MAD/h</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Début *</label>
                  <input className="input" type="datetime-local" min={now} value={form.startTime}
                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Fin (optionnel)</label>
                  <input className="input" type="datetime-local" min={form.startTime || now} value={form.endTime}
                    onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Plaque d'immatriculation</label>
                <input className="input" placeholder="12345-A-6" value={form.vehiclePlate}
                  onChange={e => setForm(p => ({ ...p, vehiclePlate: e.target.value }))} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input resize-none" rows={2} placeholder="Remarques..."
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving && <Loader2 size={15} className="animate-spin" />} Réserver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
