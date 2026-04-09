export const REGION_CODE = 'IN'
export const MAX_RESULTS = 25
export const SEARCH_DEBOUNCE_MS = 400

// YouTube video category IDs for pills
export const VIDEO_CATEGORIES = [
  { id: '0',  label: 'All' },
  { id: '10', label: 'Music' },
  { id: '20', label: 'Gaming' },
  { id: '22', label: 'People & Blogs' },
  { id: '23', label: 'Comedy' },
  { id: '24', label: 'Entertainment' },
  { id: '25', label: 'News & Politics' },
  { id: '26', label: 'Howto & Style' },
  { id: '27', label: 'Education' },
  { id: '28', label: 'Science & Technology' },
  { id: '17', label: 'Sports' },
  { id: '15', label: 'Pets & Animals' },
  { id: '19', label: 'Travel & Events' },
]

// Firestore collection paths
export const FIRESTORE = {
  WATCH_HISTORY: "watchHistory",
  LIKED_VIDEOS: "likedVideos",
  WATCH_LATER: "watchLater",
  USERS: "users",
  PLAYLIST: "playlist",
};
