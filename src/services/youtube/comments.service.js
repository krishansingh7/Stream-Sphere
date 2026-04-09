import { youtubeClient } from './apiClient'

// Get comments for a video — 1 unit per call
export const getComments = ({ videoId, pageToken = '', order = 'relevance' } = {}) =>
  youtubeClient.get('/commentThreads', {
    params: {
      part: 'snippet,replies',
      videoId,
      maxResults: 20,
      order,
      pageToken: pageToken || undefined,
    },
  })

// Post a comment — 50 units, requires user OAuth token
// Pass the user's Google OAuth accessToken from Firebase
export const postComment = ({ videoId, text, accessToken }) =>
  youtubeClient.post(
    '/commentThreads',
    {
      snippet: {
        videoId,
        topLevelComment: {
          snippet: { textOriginal: text },
        },
      },
    },
    {
      params: { part: 'snippet' },
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
