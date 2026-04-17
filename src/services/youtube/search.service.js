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
  // Extract keywords from title for highly relevant topic clustering
  const keywords = title
    ? title.split(' ').slice(0, 4).join(' ')
    : ''

  // Search by keywords and category for diverse related content
  // This avoids being trapped in a single channel's upload history (which might be 90% shorts)
  const res = await youtubeClient.get('/search', {
    params: {
      part: 'snippet',
      q: keywords || 'trending india',
      type: 'video',
      maxResults: 50,
      regionCode: REGION_CODE,
      order: 'relevance',
      ...(categoryId ? { videoCategoryId: categoryId } : {}),
    },
  })

  // Filter out the currently playing video from the results
  const items = (res.data.items || []).filter(
    (v) => (v.id?.videoId || v.id) !== videoId
  )

  return { data: { items } }
}
