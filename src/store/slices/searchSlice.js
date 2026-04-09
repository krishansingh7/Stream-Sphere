import { createSlice } from '@reduxjs/toolkit'

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: '',
    voiceActive: false,
  },
  reducers: {
    setQuery(state, action) {
      state.query = action.payload
    },
    setVoiceActive(state, action) {
      state.voiceActive = action.payload
    },
  },
})

export const { setQuery, setVoiceActive } = searchSlice.actions
export default searchSlice.reducer
