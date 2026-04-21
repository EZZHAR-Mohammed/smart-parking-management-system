import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSpots, createSpot, updateSpot, deleteSpot } from '../store/slices/spotsSlice'
import { socketUpdateSpot, socketAddSpot, socketDeleteSpot } from '../store/slices/spotsSlice'
import socket from '../socket'
import {
  ParkingSquare, Plus, Filter, Zap, Crown, Accessibility,
  Edit2, Trash2, X, Loader2, CheckCircle2, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  free: 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10',
  occupied: 'border-red-500/40 bg-red-500/5',
  reserved: 'border-amber-500/40 bg-amber-500/5',
  maintenance: 'border-slate-500/40 bg-slate-500/5',
}
const TYPE_ICON = { normal: ParkingSquare, vip: Crown, handicap: Accessibility, electric: Zap }
const TYPE_COLOR = { normal: 'text-slate-400', vip: 'text-amber-400', handicap: 'text-blue-400', electric: 'text-green-400' }

const EMPTY_FORM = { number: '', type: 'normal', floor: 'RDC', section: '', pricePerHour: 5 }

export default function SpotsPage() {
  const dispatch = useDispatch()
  const { spots, stats, loading } = useSelector(s => s.spots)
  const { user } = useSelector(s => s.auth)
  const isAdmin = user?.role === 'admin'

  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editSpot, setEditSpot] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchSpots())
    socket.on('spot-updated', data => dispatch(socketUpdateSpot(data)))
    socket.on('spot-created', data => dispatch(socketAddSpot(data)))
    socket.on('spot-deleted', data => dispatch(socketDeleteSpot(data)))
    return () => { socket.off('spot-updated'); socket.off('spot-created'); socket.off('spot-deleted') }
  }, [])

  const filtered = spots.filter(s =>
    (!filterStatus || s.status === filterStatus) &&
    (!filterType || s.type === filterType)
  )

  const openCreate = () => { setEditSpot(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (spot) => { setEditSpot(spot); setForm({ number: spot.number, type: spot.type, floor: spot.floor, section: spot.section || '', pricePerHour: spot.pricePerHour }); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editSpot) {
        await dispatch(updateSpot({ id: editSpot.id, data: form })).unwrap()
        toast.success('Place mise à jour')
      } else {
        await dispatch(createSpot(form)).unwrap()
        toast.success('Place créée')
      }
      setShowModal(false)
    } catch (err) {
      toast.error(err || 'Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette place ?')) return
    try {
      await dispatch(deleteSpot(id)).unwrap()
      toast.success('Place supprimée')
    } catch (err) { toast.error(err || 'Erreur') }
  }

  const handleStatusChange = async (spot, status) => {
    try {
      await dispatch(updateSpot({ id: spot.id, data: { status } })).unwrap()
      toast.success('Statut mis à jour')
    } catch (err) { toast.error(err || 'Erreur') }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Places de Parking</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {stats?.free ?? 0} libres · {stats?.occupied ?? 0} occupées · {stats?.reserved ?? 0} réservées
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => dispatch(fetchSpots())} className="btn-ghost text-sm"><RefreshCw size={14} /></button>
          {isAdmin && <button onClick={openCreate} className="btn-primary text-sm"><Plus size={15} /> Ajouter</button>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'free', 'occupied', 'reserved', 'maintenance'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterStatus === s ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'border-white/5 text-slate-500 hover:text-white hover:border-white/15'}`}>
            {s || 'Tous'}
          </button>
        ))}
        <div className="w-px bg-white/5 mx-1" />
        {['', 'normal', 'vip', 'handicap', 'electric'].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${filterType === t ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'border-white/5 text-slate-500 hover:text-white hover:border-white/15'}`}>
            {t || 'Tous types'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-primary-400" size={28} /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-slate-500">Aucune place trouvée</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(spot => {
            const Icon = TYPE_ICON[spot.type] || ParkingSquare
            return (
              <div key={spot.id}
                className={`relative rounded-2xl border p-3 transition-all duration-200 ${STATUS_COLORS[spot.status] || 'border-white/5 bg-white/3'}`}>
                {/* Status dot */}
                <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${spot.status === 'free' ? 'bg-emerald-400 animate-pulse' : spot.status === 'occupied' ? 'bg-red-400' : spot.status === 'reserved' ? 'bg-amber-400' : 'bg-slate-400'}`} />

                <Icon size={20} className={`${TYPE_COLOR[spot.type]} mb-2`} />
                <div className="font-display font-bold text-white text-sm">{spot.number}</div>
                <div className="text-xs text-slate-500 capitalize mt-0.5">{spot.floor} · {spot.type}</div>
                <div className="text-xs text-slate-600 mt-0.5 font-mono">{spot.pricePerHour} MAD/h</div>

                {isAdmin && (
                  <div className="mt-2 flex gap-1">
                    <button onClick={() => openEdit(spot)} className="flex-1 text-xs py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                      <Edit2 size={11} className="mx-auto" />
                    </button>
                    <button onClick={() => handleDelete(spot.id)} className="flex-1 text-xs py-1 rounded-lg bg-red-500/5 hover:bg-red-500/15 text-red-500 transition-all">
                      <Trash2 size={11} className="mx-auto" />
                    </button>
                  </div>
                )}
                {isAdmin && spot.status !== 'free' && (
                  <button onClick={() => handleStatusChange(spot, 'free')}
                    className="w-full mt-1 text-xs py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all flex items-center justify-center gap-1">
                    <CheckCircle2 size={11} /> Libérer
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal create/edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card w-full max-w-md border-white/10 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-white text-lg">{editSpot ? 'Modifier la place' : 'Nouvelle place'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Numéro *</label>
                  <input className="input" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="A-01" required />
                </div>
                <div>
                  <label className="label">Étage</label>
                  <input className="input" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} placeholder="RDC" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {['normal', 'vip', 'handicap', 'electric'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Prix/heure (MAD)</label>
                  <input className="input" type="number" step="0.5" min="0" value={form.pricePerHour}
                    onChange={e => setForm(p => ({ ...p, pricePerHour: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Section</label>
                <input className="input" value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))} placeholder="A" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                  {editSpot ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
