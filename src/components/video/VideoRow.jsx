import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatViews, formatDuration, timeAgo, getThumbnail } from '../../utils/formatters'

const VideoRow = ({ video, onRemove }) => {
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
        className={`flex flex-col sm:flex-row gap-3 cursor-pointer sm:rounded-xl sm:p-2 sm:-mx-2 transition-all duration-200
          ${confirmDelete ? 'opacity-30 scale-[0.98] pointer-events-none' : 'hover:bg-yt-bg2'}`}
      >
        {/* Thumbnail */}
        <div
          className="relative w-full sm:w-40 lg:w-48 flex-shrink-0 aspect-video sm:rounded-lg overflow-hidden bg-yt-bg2"
          onClick={() => navigate(`/watch?v=${videoId}`)}
        >
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" loading="lazy" />
          {duration && (
            <span className="absolute bottom-1 right-1 bg-black/85 text-white text-xs font-medium px-1 py-0.5 rounded">
              {duration}
            </span>
          )}
        </div>

        {/* Info & Action grouping */}
        <div className="flex flex-1 gap-3 px-3 sm:px-0 pb-4 sm:pb-0">
          {/* Info */}
          <div className="flex-1 min-w-0 py-1">
            <h3
              className="text-sm sm:text-base font-medium text-yt-text line-clamp-2 leading-snug mb-1"
              onClick={() => navigate(`/watch?v=${videoId}`)}
            >
              {title}
            </h3>
            <p
              className="text-xs text-yt-text2 hover:text-yt-text cursor-pointer truncate"
              onClick={(e) => { e.stopPropagation(); navigate(`/channel/${channelId}`); }}
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
                self-start mt-0.5 flex-shrink-0 p-2 rounded-full text-yt-text2 transition-all
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
      </div>

      {/* ── Confirm delete overlay ── */}
      {confirmDelete && (
        <div className="absolute inset-0 top-0 bottom-4 mx-3 sm:mx-0 sm:-mx-2 sm:bottom-0 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-5 sm:gap-3 p-6 sm:px-4 sm:py-0 bg-yt-bg2/95 sm:bg-yt-bg2 backdrop-blur-md sm:backdrop-blur-none rounded-2xl sm:rounded-xl border border-yt-border z-10 animate-fadeIn shadow-2xl sm:shadow-none">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 text-center sm:text-left min-w-0">
            <div className="w-14 h-14 sm:w-auto sm:h-auto rounded-full bg-yt-red/10 sm:bg-transparent flex items-center justify-center flex-shrink-0 mb-1 sm:mb-0">
              <svg className="w-7 h-7 sm:w-5 sm:h-5 text-yt-red" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
              </svg>
            </div>
            <div>
              <p className="text-lg sm:text-sm font-semibold sm:font-medium text-yt-text truncate">Remove video?</p>
              <p className="text-sm text-yt-text2 mt-1.5 sm:hidden">This will permanently remove it from this list.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setConfirmDelete(false)
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-medium text-yt-text bg-yt-bg3 sm:bg-transparent rounded-full hover:bg-yt-border sm:hover:bg-yt-bg3 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(videoId)
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs font-semibold text-white bg-yt-red rounded-full hover:bg-red-600 active:scale-95 transition-all shadow-lg sm:shadow-none"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(VideoRow)
