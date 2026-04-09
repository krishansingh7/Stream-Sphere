import { youtubeClient } from './apiClient'

// Get channel details by ID — 1 unit
export const getChannelDetails = (channelId) =>
  youtubeClient.get('/channels', {
    params: {
      part: 'snippet,statistics,brandingSettings,contentDetails',
      id: channelId,
    },
  })

// Get channel's uploads playlist videos — 1 unit
// channelId starts with "UC" — replace with "UU" to get uploads playlist
export const getChannelVideos = ({ channelId, pageToken = '' } = {}) => {
  const uploadsPlaylistId = channelId.replace(/^UC/, 'UU')
  return youtubeClient.get('/playlistItems', {
    params: {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 24,
      pageToken: pageToken || undefined,
    },
  })
}
