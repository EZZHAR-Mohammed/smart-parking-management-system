import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMe, logout } from '../store/slices/authSlice'
import { usersService, authService } from '../services'
import { User, Mail, Phone, Lock, Save, Loader2, LogOut, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const handleProfile = async e => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await usersService.update(user.id, profileForm)
      await dispatch(fetchMe())
      toast.success('Profil mis à jour !')
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSavingProfile(false) }
  }

  const handlePassword = async e => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Les mots de passe ne correspondent pas')
    setSavingPw(true)
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Mot de passe changé !')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur') }
    finally { setSavingPw(false) }
  }

  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  return (
    <div className="space-y-5 animate-slide-up max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Mon Profil</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gérez vos informations personnelles</p>
      </div>

      {/* Avatar card */}
      <div className="card flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl shrink-0 ${user?.role === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-primary-500/15 text-primary-400'}`}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-white text-lg">{user?.name}</h2>
            {user?.role === 'admin'
              ? <span className="badge-reserved"><ShieldCheck size={11} />Admin</span>
              : <span className="badge-active"><User size={11} />Utilisateur</span>
            }
          </div>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><User size={16} className="text-primary-400" />Informations personnelles</h3>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="label">Nom complet</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-10" value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-10" type="email" value={profileForm.email}
                onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Téléphone</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input pl-10" type="tel" placeholder="+212600000000" value={profileForm.phone}
                onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary text-sm">
            {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Enregistrer
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Lock size={16} className="text-primary-400" />Changer le mot de passe</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Mot de passe actuel', ph: '••••••••' },
            { key: 'newPassword',     label: 'Nouveau mot de passe', ph: 'Min. 6 caractères' },
            { key: 'confirm',         label: 'Confirmer',           ph: '••••••••' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input pl-10" type="password" placeholder={ph}
                  value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} required />
              </div>
            </div>
          ))}
          <button type="submit" disabled={savingPw} className="btn-primary text-sm">
            {savingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            Changer le mot de passe
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="card border-red-500/10">
        <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2"><LogOut size={16} className="text-red-400" />Déconnexion</h3>
        <p className="text-slate-500 text-sm mb-4">Vous serez redirigé vers la page de connexion.</p>
        <button onClick={handleLogout} className="btn-danger text-sm">
          <LogOut size={15} /> Se déconnecter
        </button>
      </div>
    </div>
  )
}
