import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    sidebarMini: false,
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload
    },
    toggleSidebarMini(state) {
      state.sidebarMini = !state.sidebarMini
    },
  },
})

export const { toggleSidebar, setSidebarOpen, toggleSidebarMini } = uiSlice.actions
export default uiSlice.reducer
