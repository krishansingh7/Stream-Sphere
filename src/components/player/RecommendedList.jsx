import { useNavigate } from 'react-router-dom'
import { useRelatedVideos } from '../../hooks/api/useRelatedVideos'
import { formatViews, formatDuration, timeAgo, getThumbnail } from '../../utils/formatters'

function RelatedCard({ video }) {
  const navigate = useNavigate()
  const { snippet, statistics, contentDetails } = video
  const videoId = video.id?.videoId || video.id
  const thumbnail = getThumbnail(snippet?.thumbnails)
  const duration = formatDuration(contentDetails?.duration)

  return (
    <div
      className="flex gap-2 cursor-pointer group rounded-xl hover:bg-yt-bg2 p-1 -mx-1 transition-colors"
      onClick={() => navigate(`/watch?v=${videoId}`)}
    >
      {/* Thumbnail */}
      <div className="relative w-[168px] flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-yt-bg2">
        <img
          src={thumbnail}
          alt={snippet?.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {duration && (
          <span className="absolute bottom-1 right-1 bg-black/85 text-white text-xs font-medium px-1 py-0.5 rounded">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-yt-text line-clamp-2 leading-snug mb-1">
          {snippet?.title}
        </p>
        <p className="text-xs text-yt-text2 hover:text-yt-text truncate">
          {snippet?.channelTitle}
        </p>
        <p className="text-xs text-yt-text2">
          {formatViews(statistics?.viewCount)}
          {statistics?.viewCount && ' · '}
          {timeAgo(snippet?.publishedAt)}
        </p>
      </div>
    </div>
  )
}

// Skeleton for loading state
function RelatedSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="skeleton w-[168px] aspect-video rounded-lg flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1 py-1">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

export default function RecommendedList({ videoId, channelId, categoryId, title }) {
  const { data: related = [], isLoading } = useRelatedVideos(videoId, channelId, categoryId, title)

  return (
    <div className="flex flex-col gap-2">
      {isLoading
        ? Array.from({ length: 10 }).map((_, i) => <RelatedSkeleton key={i} />)
        : related.length === 0
          ? <p className="text-yt-text2 text-sm text-center py-8">No recommendations available</p>
          : related.map((v) => (
              <RelatedCard key={v.id?.videoId || v.id} video={v} />
            ))
      }
    </div>
  )
}
