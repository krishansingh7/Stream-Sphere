import { createSlice } from "@reduxjs/toolkit";

// Stores the currently playing video globally
// This persists across page navigations — the player never unmounts
const playerSlice = createSlice({
  name: "player",
  initialState: {
    videoId: null,
    title: "",
    channelTitle: "",
    thumbnail: "",
    isPlaying: false,
    isMiniActive: false, // mini player visible (user navigated away)
  },
  reducers: {
    setVideo(state, action) {
      const { videoId, title, channelTitle, thumbnail } = action.payload;
      state.videoId = videoId;
      state.title = title || "";
      state.channelTitle = channelTitle || "";
      state.thumbnail = thumbnail || "";
      state.isPlaying = true;
      state.isMiniActive = false;
    },
    showMiniPlayer(state) {
      if (state.videoId) state.isMiniActive = true;
    },
    hideMiniPlayer(state) {
      state.isMiniActive = false;
    },
    setPlaying(state, action) {
      state.isPlaying = action.payload;
    },
    closePlayer(state) {
      state.videoId = null;
      state.title = "";
      state.channelTitle = "";
      state.thumbnail = "";
      state.isPlaying = false;
      state.isMiniActive = false;
    },
  },
});

export const {
  setVideo,
  showMiniPlayer,
  hideMiniPlayer,
  setPlaying,
  closePlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
