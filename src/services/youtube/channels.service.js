import { youtubeClient } from './apiClient'

// Get channel details by ID — 1 unit
export const getChannelDetails = (channelId) =>
  youtubeClient.get('/channels', {
    params: {
      part: 'snippet,statistics,brandingSettings,contentDetails',
      id: channelId,
    },
  })

// Get channel details by custom handle (e.g. @tseries) — 1 unit
export const getChannelByHandle = (handle) =>
  youtubeClient.get('/channels', {
    params: {
      part: 'snippet,statistics,brandingSettings,contentDetails',
      forHandle: handle.startsWith('@') ? handle : `@${handle}`,
    },
  })

// Get channel's uploads playlist videos — 1 unit per page
// channelId starts with "UC" — replace with "UU" to get uploads playlist
export const getChannelVideos = ({ channelId, pageToken = '' } = {}) => {
  const uploadsPlaylistId = channelId.replace(/^UC/, 'UU')
  return youtubeClient.get('/playlistItems', {
    params: {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 30,
      pageToken: pageToken || undefined,
    },
  })
}

// Batch fetch video stats (views, duration) for a list of video IDs — 1 unit
export const getVideoStatsBatch = (videoIds = []) =>
  youtubeClient.get('/videos', {
    params: {
      part: 'statistics,contentDetails',
      id: videoIds.join(','),
    },
  })
