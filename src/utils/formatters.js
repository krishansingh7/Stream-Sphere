// Format view counts: 1200000 → "1.2M views"
export const formatViews = (count) => {
  const n = parseInt(count, 10);
  if (isNaN(n)) return "0 views";

  const format = (num, divisor, suffix) => {
    const value = num / divisor;
    return Number.isInteger(value)
      ? `${value}${suffix} views`
      : `${value.toFixed(1)}${suffix} views`;
  };

  if (n >= 1_000_000_000) return format(n, 1_000_000_000, "B");
  if (n >= 1_000_000) return format(n, 1_000_000, "M");
  if (n >= 1_000) return format(n, 1_000, "K");

  return `${n} views`;
};

// Format like/comment counts — no suffix, correct K/M/B
// 12173000 → "12.2M"   467000 → "467K"   999 → "999"
export const formatCount = (count) => {
  const n = parseInt(count, 10);
  if (isNaN(n)) return "0";

  const format = (num, divisor, suffix) => {
    const value = num / divisor;
    return Number.isInteger(value)
      ? `${value}${suffix}` // 1K, 2M
      : `${value.toFixed(1)}${suffix}`; // 1.2K, 1.5M
  };

  if (n >= 1_000_000_000) return format(n, 1_000_000_000, "B");
  if (n >= 1_000_000) return format(n, 1_000_000, "M");
  if (n >= 1_000) return format(n, 1_000, "K");

  return n.toLocaleString();
};

// Format subscriber counts: 30000000 → "30M"
export const formatSubscribers = (count) => {
  const n = parseInt(count, 10)
  if (isNaN(n)) return '0'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return `${n}`
}

// Parse ISO 8601 duration: "PT10M30S" → "10:30"
export const formatDuration = (iso) => {
  if (!iso) return ''
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = parseInt(match[1] || 0)
  const m = parseInt(match[2] || 0)
  const s = parseInt(match[3] || 0)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

// Time ago: "2025-04-01" → "6 days ago"
export const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`
  return `${Math.floor(diff / 31536000)} years ago`
}

// Get best thumbnail URL from snippet.thumbnails
export const getThumbnail = (thumbnails) => {
  return (
    thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    ''
  )
}

// Extract a compact video object for Firestore storage
export const toFirestoreVideo = (video) => ({
  id: video.id,
  title: video.snippet?.title || '',
  thumbnail: getThumbnail(video.snippet?.thumbnails),
  channelTitle: video.snippet?.channelTitle || '',
  channelId: video.snippet?.channelId || '',
  duration: video.contentDetails?.duration || '',
  viewCount: video.statistics?.viewCount || '0',
  publishedAt: video.snippet?.publishedAt || '',
})
