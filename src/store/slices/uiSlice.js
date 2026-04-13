import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: window.innerWidth >= 1024,
  sidebarMini: false,
  theme: localStorage.getItem('theme') || 'dark',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
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
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.theme)
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
  },
})

export const { toggleSidebar, setSidebarOpen, toggleSidebarMini, toggleTheme } = uiSlice.actions
export default uiSlice.reducer
