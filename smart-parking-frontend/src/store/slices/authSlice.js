import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services'
import { connectSocket, disconnectSocket } from '../../socket'

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const res = await authService.login(creds)
    return res.data.data
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Erreur connexion')
  }
})

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data)
    return res.data.data
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Erreur inscription')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.me()
    return res.data.data.user
  } catch (e) {
    return rejectWithValue(e.response?.data?.message)
  }
})

const stored = localStorage.getItem('user')
const initialState = {
  user: stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      disconnectSocket()
    },
    clearError(state) { state.error = null },
  },
  extraReducers: (b) => {
    const handleAuth = (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      connectSocket(action.payload.token)
    }
    b.addCase(login.pending,    (s) => { s.loading = true; s.error = null })
    b.addCase(login.fulfilled,  handleAuth)
    b.addCase(login.rejected,   (s, a) => { s.loading = false; s.error = a.payload })
    b.addCase(register.pending, (s) => { s.loading = true; s.error = null })
    b.addCase(register.fulfilled, handleAuth)
    b.addCase(register.rejected,(s, a) => { s.loading = false; s.error = a.payload })
    b.addCase(fetchMe.fulfilled,(s, a) => { s.user = a.payload; localStorage.setItem('user', JSON.stringify(a.payload)) })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
