import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import searchReducer from './slices/searchSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    search: searchReducer,
  },
})
