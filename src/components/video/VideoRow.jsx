import { useNavigate } from 'react-router-dom'
import { formatViews, formatDuration, timeAgo, getThumbnail } from '../../utils/formatters'

export default function VideoRow({ video, onRemove }) {
  const navigate = useNavigate()
  if (!video) return null

  const videoId = video.id?.videoId || video.id
  const thumbnail = video.thumbnail || getThumbnail(video.snippet?.thumbnails)
  const title = video.title || video.snippet?.title
  const channelTitle = video.channelTitle || video.snippet?.channelTitle
  const channelId = video.channelId || video.snippet?.channelId
  const duration = formatDuration(video.duration || video.contentDetails?.duration)
  const views = formatViews(video.viewCount || video.statistics?.viewCount)
  const ago = timeAgo(video.publishedAt || video.snippet?.publishedAt)

  return (
    <div className="flex gap-3 group cursor-pointer hover:bg-yt-bg2 rounded-xl p-2 -mx-2 transition-colors">
      {/* Thumbnail */}
      <div
        className="relative w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-yt-bg2"
        onClick={() => navigate(`/watch?v=${videoId}`)}
      >
        <img src={thumbnail} alt={title} className="w-full h-full object-cover" loading="lazy" />
        {duration && (
          <span className="absolute bottom-1 right-1 bg-black/85 text-white text-xs font-medium px-1 py-0.5 rounded">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-1">
        <h3
          className="text-sm font-medium text-yt-text line-clamp-2 leading-snug mb-1"
          onClick={() => navigate(`/watch?v=${videoId}`)}
        >
          {title}
        </h3>
        <p
          className="text-xs text-yt-text2 hover:text-yt-text cursor-pointer"
          onClick={() => navigate(`/channel/${channelId}`)}
        >
          {channelTitle}
        </p>
        <p className="text-xs text-yt-text2">{views} · {ago}</p>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(videoId) }}
          className="opacity-0 group-hover:opacity-100 self-center p-1.5 rounded-full hover:bg-yt-bg3 text-yt-text2 transition-opacity flex-shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </div>
  )
}
