// Centralized React Query key factory
// Ensures consistent cache keys across the app
export const queryKeys = {
  trending: (categoryId) => ['trending', categoryId],
  videoDetails: (videoId) => ['video', videoId],
  search: (query, order) => ['search', query, order],
  relatedVideos: (videoId) => ['related', videoId],
  comments: (videoId) => ['comments', videoId],
  channel: (channelId) => ['channel', channelId],
  channelVideos: (channelId) => ['channelVideos', channelId],
  categories: () => ['videoCategories'],
  history: (uid) => ['history', uid],
  liked: (uid) => ['liked', uid],
  watchLater: (uid) => ['watchLater', uid],
}
