import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import spotsReducer from './slices/spotsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    spots: spotsReducer,
  },
})
