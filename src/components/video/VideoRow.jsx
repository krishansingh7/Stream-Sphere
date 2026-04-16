import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatViews, formatDuration, timeAgo, getThumbnail } from '../../utils/formatters'

export default function VideoRow({ video, onRemove }) {
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!video) return null

  const videoId      = video.id?.videoId || video.id
  const thumbnail    = video.thumbnail || getThumbnail(video.snippet?.thumbnails)
  const title        = video.title || video.snippet?.title
  const channelTitle = video.channelTitle || video.snippet?.channelTitle
  const channelId    = video.channelId || video.snippet?.channelId
  const duration     = formatDuration(video.duration || video.contentDetails?.duration)
  const views        = formatViews(video.viewCount || video.statistics?.viewCount)
  const ago          = timeAgo(video.publishedAt || video.snippet?.publishedAt)

  return (
    <div className="relative group">
      {/* ── Main row ── */}
      <div
        className={`flex gap-3 cursor-pointer rounded-xl p-2 -mx-2 transition-all duration-200
          ${confirmDelete ? 'opacity-30 scale-[0.98] pointer-events-none' : 'hover:bg-yt-bg2'}`}
      >
        {/* Thumbnail */}
        <div
          className="relative w-36 sm:w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-yt-bg2"
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
            className="text-xs text-yt-text2 hover:text-yt-text cursor-pointer truncate"
            onClick={() => navigate(`/channel/${channelId}`)}
          >
            {channelTitle}
          </p>
          <p className="text-xs text-yt-text2 mt-0.5">{views} · {ago}</p>
        </div>

        {/* Delete button — always visible on mobile, hover-only on desktop */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setConfirmDelete(true)
            }}
            title="Remove from history"
            className={`
              self-center flex-shrink-0 p-2 rounded-full text-yt-text2 transition-all
              /* Mobile: always visible */
              opacity-100
              /* Desktop: only on hover */
              md:opacity-0 md:group-hover:opacity-100
              hover:bg-yt-bg3 hover:text-yt-text active:scale-90
            `}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Confirm delete overlay ── */}
      {confirmDelete && (
        <div className="absolute inset-0 -mx-2 flex items-center justify-between gap-3 px-4 bg-yt-bg2 rounded-xl border border-yt-border z-10 animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-5 h-5 text-yt-red flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            <p className="text-sm text-yt-text truncate">Remove from history?</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 text-xs font-medium text-yt-text2 rounded-full hover:bg-yt-bg3 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(videoId)
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-yt-red rounded-full hover:opacity-90 active:scale-95 transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
