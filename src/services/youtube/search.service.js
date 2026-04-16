import { youtubeClient } from './apiClient'
import { REGION_CODE, MAX_RESULTS } from '../../config/constants'

// Search autocomplete suggestions — uses Vite proxy to fix CORS on localhost
export const getSearchSuggestions = async (query) => {
  try {
    const res = await fetch(
      `/api/suggestions?client=firefox&ds=yt&q=${encodeURIComponent(query)}`
    )
    const data = await res.json()
    return data[1] || []
  } catch {
    return []
  }
}

// Search videos — 100 units per call
export const searchVideos = ({ query, pageToken = '', order = 'relevance' } = {}) =>
  youtubeClient.get('/search', {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: MAX_RESULTS,
      regionCode: REGION_CODE,
      order,
      pageToken: pageToken || undefined,
    },
  })

// Related/recommended videos — replaces deprecated relatedToVideoId
// Strategy: search by channel + category for best results
export const getRelatedVideos = async ({ videoId, channelId, categoryId, title } = {}) => {
  // Extract keywords from title for relevant results
  const keywords = title
    ? title.split(' ').slice(0, 4).join(' ')
    : ''

  try {
    // First try: search by channel (most relevant)
    if (channelId) {
      const res = await youtubeClient.get('/search', {
        params: {
          part: 'snippet',
          channelId,
          type: 'video',
          maxResults: 15,
          order: 'relevance',
          regionCode: REGION_CODE,
        },
      })
      const items = (res.data.items || []).filter(
        (v) => (v.id?.videoId || v.id) !== videoId
      )
      if (items.length >= 5) return { data: { items } }
    }
  } catch {}

  // Fallback: search by keywords
  return youtubeClient.get('/search', {
    params: {
      part: 'snippet',
      q: keywords || 'trending india',
      type: 'video',
      maxResults: 15,
      regionCode: REGION_CODE,
      order: 'relevance',
      ...(categoryId ? { videoCategoryId: categoryId } : {}),
    },
  })
}
