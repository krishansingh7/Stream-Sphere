import axios from 'axios'

const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export const youtubeClient = axios.create({
  baseURL: BASE_URL,
  params: {
    key: import.meta.env.VITE_YOUTUBE_API_KEY,
  },
})

// Response interceptor — handle quota errors gracefully
youtubeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('[YouTube API] Quota exceeded or API key invalid.')
    }
    return Promise.reject(error)
  }
)
