import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../store/slices/authSlice'
import { ParkingSquare, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector(s => s.auth)

  useEffect(() => { if (token) navigate('/dashboard') }, [token])
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()) } }, [error])

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const res = await dispatch(login(form))
    if (!res.error) { toast.success('Bienvenue !'); navigate('/dashboard') }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 items-center justify-center mb-4">
            <ParkingSquare size={26} className="text-primary-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">SmartPark</h1>
          <p className="text-slate-500 text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div className="card border-white/8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder="admin@parking.com" required
                  className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input name="password" type="password" value={form.password} onChange={handle}
                  placeholder="••••••••" required
                  className="input pl-10" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-500">
            Pas de compte ?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              S'inscrire
            </Link>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 p-3 rounded-xl border border-white/5 bg-white/2 text-xs text-slate-500 font-mono text-center">
          admin@parking.com / admin123
        </div>
      </div>
    </div>
  )
}
