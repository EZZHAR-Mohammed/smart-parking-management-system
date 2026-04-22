import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { spotsService } from '../../services'

export const fetchSpots = createAsyncThunk('spots/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await spotsService.getAll(params)
    return res.data.data
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const createSpot = createAsyncThunk('spots/create', async (data, { rejectWithValue }) => {
  try {
    const res = await spotsService.create(data)
    return res.data.data.spot
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const updateSpot = createAsyncThunk('spots/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await spotsService.update(id, data)
    return res.data.data.spot
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

export const deleteSpot = createAsyncThunk('spots/delete', async (id, { rejectWithValue }) => {
  try {
    await spotsService.delete(id)
    return id
  } catch (e) { return rejectWithValue(e.response?.data?.message) }
})

const spotsSlice = createSlice({
  name: 'spots',
  initialState: { spots: [], stats: {}, loading: false, error: null },
  reducers: {
    socketUpdateSpot(state, action) {
      const idx = state.spots.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) state.spots[idx] = { ...state.spots[idx], ...action.payload }
    },
    socketAddSpot(state, action) {
      state.spots = [action.payload, ...state.spots.filter(s => s.id !== action.payload.id)]
    },
    socketDeleteSpot(state, action) {
      state.spots = state.spots.filter(s => s.id !== parseInt(action.payload.id))
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchSpots.pending,   (s) => { s.loading = true })
    b.addCase(fetchSpots.fulfilled, (s, a) => { s.loading = false; s.spots = a.payload.spots; s.stats = a.payload.stats })
    b.addCase(fetchSpots.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
    b.addCase(createSpot.fulfilled, (s, a) => { s.spots = [a.payload, ...s.spots.filter(sp => sp.id !== a.payload.id)] })
    b.addCase(updateSpot.fulfilled, (s, a) => {
      const idx = s.spots.findIndex(sp => sp.id === a.payload.id)
      if (idx !== -1) s.spots[idx] = a.payload
    })
    b.addCase(deleteSpot.fulfilled, (s, a) => { s.spots = s.spots.filter(sp => sp.id !== a.payload) })
  },
})

export const { socketUpdateSpot, socketAddSpot, socketDeleteSpot } = spotsSlice.actions
export default spotsSlice.reducer
