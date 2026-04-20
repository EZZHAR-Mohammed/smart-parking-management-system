import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMe } from './store/slices/authSlice'
import { connectSocket } from './socket'

import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SpotsPage from './pages/SpotsPage'
import ReservationsPage from './pages/ReservationsPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import PaymentsPage from './pages/PaymentsPage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector(s => s.auth)
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/spots" replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector(s => s.auth)

  useEffect(() => {
    if (token) {
      dispatch(fetchMe())
      connectSocket(token)
    }
  }, [token])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'DM Sans' },
          success: { iconTheme: { primary: '#0ea5e9', secondary: '#0f172a' } },
        }}
      />
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<PrivateRoute adminOnly><DashboardPage /></PrivateRoute>} />
          <Route path="spots"         element={<SpotsPage />} />
          <Route path="reservations"  element={<ReservationsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="payments"      element={<PaymentsPage />} />
          <Route path="profile"       element={<ProfilePage />} />
          <Route path="users"         element={<PrivateRoute adminOnly><UsersPage /></PrivateRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
