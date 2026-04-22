import api from './api'

// ── Auth ──────────────────────────────────────────────────────
export const authService = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  me:             ()     => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
}

// ── Spots ─────────────────────────────────────────────────────
export const spotsService = {
  getAll:   (params) => api.get('/spots', { params }),
  getById:  (id)     => api.get(`/spots/${id}`),
  create:   (data)   => api.post('/spots', data),
  update:   (id, data) => api.put(`/spots/${id}`, data),
  delete:   (id)     => api.delete(`/spots/${id}`),
}

// ── Reservations ──────────────────────────────────────────────
export const reservationsService = {
  getAll:   (params) => api.get('/reservations', { params }),
  getById:  (id)     => api.get(`/reservations/${id}`),
  create:   (data)   => api.post('/reservations', data),
  end:      (id)     => api.put(`/reservations/${id}/end`),
  cancel:   (id)     => api.delete(`/reservations/${id}`),
}

// ── Subscriptions ─────────────────────────────────────────────
export const subscriptionsService = {
  getAll:   (params) => api.get('/subscriptions', { params }),
  getById:  (id)     => api.get(`/subscriptions/${id}`),
  create:   (data)   => api.post('/subscriptions', data),
  update:   (id, data) => api.put(`/subscriptions/${id}`, data),
  renew:    (id)     => api.post(`/subscriptions/${id}/renew`),
}

// ── Payments ──────────────────────────────────────────────────
export const paymentsService = {
  getAll:   (params) => api.get('/payments', { params }),
  getById:  (id)     => api.get(`/payments/${id}`),
  create:   (data)   => api.post('/payments', data),
  refund:   (id)     => api.put(`/payments/${id}/refund`),
}

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardService = {
  getStats:     () => api.get('/dashboard/stats'),
  getOccupancy: () => api.get('/dashboard/occupancy'),
  getRevenue:   (period) => api.get('/dashboard/revenue', { params: { period } }),
}

// ── Users ─────────────────────────────────────────────────────
export const usersService = {
  getAll:   (params) => api.get('/users', { params }),
  getById:  (id)     => api.get(`/users/${id}`),
  update:   (id, data) => api.put(`/users/${id}`, data),
  delete:   (id)     => api.delete(`/users/${id}`),
}
