import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../store/slices/authSlice'
import { ParkingSquare, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector(s => s.auth)

  useEffect(() => { if (token) navigate('/dashboard') }, [token])
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()) } }, [error])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    const res = await dispatch(register(form))
    if (!res.error) { toast.success('Compte créé !'); navigate('/dashboard') }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 items-center justify-center mb-4">
            <ParkingSquare size={26} className="text-primary-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-slate-500 text-sm mt-1">Rejoignez SmartPark</p>
        </div>

        <div className="card border-white/8">
          <form onSubmit={submit} className="space-y-4">
            {[
              { name: 'name',     label: 'Nom complet',    icon: User,  type: 'text',     ph: 'Mohamed Alami' },
              { name: 'email',    label: 'Email',          icon: Mail,  type: 'email',    ph: 'vous@exemple.com' },
              { name: 'phone',    label: 'Téléphone',      icon: Phone, type: 'tel',      ph: '+212600000000' },
              { name: 'password', label: 'Mot de passe',   icon: Lock,  type: 'password', ph: '••••••••' },
            ].map(({ name, label, icon: Icon, type, ph }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name={name} type={type} value={form[name]} onChange={handle}
                    placeholder={ph} required={name !== 'phone'}
                    className="input pl-10" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
