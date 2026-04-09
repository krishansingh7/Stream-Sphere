import { youtubeClient } from './apiClient'
import { REGION_CODE, MAX_RESULTS } from '../../config/constants'

// Trending / Most Popular — 1 unit per call
// NOTE: never pass videoCategoryId='' — that causes 400 Bad Request
export const getTrendingVideos = ({ categoryId = '0', pageToken = '' } = {}) =>
  youtubeClient.get('/videos', {
    params: {
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      regionCode: REGION_CODE,
      // Only include videoCategoryId when a real category is selected
      ...(categoryId && categoryId !== '0' ? { videoCategoryId: categoryId } : {}),
      maxResults: MAX_RESULTS,
      pageToken: pageToken || undefined,
    },
  })

// Get full video details by ID(s) — 1 unit per call (batch up to 50 IDs)
export const getVideoDetails = (videoIds) => {
  const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds
  return youtubeClient.get('/videos', {
    params: {
      part: 'snippet,statistics,contentDetails,player',
      id: ids,
    },
  })
}

// Get video categories — 1 unit, fetch once and cache
export const getVideoCategories = () =>
  youtubeClient.get('/videoCategories', {
    params: {
      part: 'snippet',
      regionCode: REGION_CODE,
    },
  })
