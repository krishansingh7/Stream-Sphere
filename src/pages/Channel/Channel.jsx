import { useParams } from 'react-router-dom'
import { useChannelDetails, useChannelVideos } from '../../hooks/api/useChannelDetails'
import { formatSubscribers } from '../../utils/formatters'
import VideoCard from '../../components/video/VideoCard'
import VideoCardSkeleton from '../../components/video/VideoCardSkeleton'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

export default function Channel() {
  const { channelId } = useParams()
  const { data: channel, isLoading: channelLoading, isError } = useChannelDetails(channelId)
  const { data: videos = [], isLoading: videosLoading } = useChannelVideos(channelId)

  if (channelLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (isError || !channel) return <ErrorMessage message="Channel not found." />

  const { snippet, statistics, brandingSettings } = channel
  const banner = brandingSettings?.image?.bannerExternalUrl

  return (
    <div>
      {/* Banner */}
      {banner && (
        <div className="w-full h-32 md:h-48 overflow-hidden bg-yt-bg2">
          <img src={`${banner}=w1280-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`} alt="Channel banner" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Channel info */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-yt-border">
        <div className="w-20 h-20 rounded-full bg-yt-bg3 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl font-medium text-yt-text">
          {snippet?.thumbnails?.high?.url
            ? <img src={snippet.thumbnails.high.url} alt={snippet.title} className="w-full h-full object-cover" />
            : snippet?.title?.[0]?.toUpperCase()
          }
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-yt-text">{snippet?.title}</h1>
          <p className="text-sm text-yt-text2 mt-1">
            {formatSubscribers(statistics?.subscriberCount)} subscribers · {parseInt(statistics?.videoCount || 0).toLocaleString()} videos
          </p>
          <p className="text-sm text-yt-text2 mt-1 line-clamp-1">{snippet?.description}</p>
        </div>
      </div>

      {/* Videos grid */}
      <div className="px-6 py-4">
        <h2 className="text-lg font-medium text-yt-text mb-4">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videosLoading
            ? Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)
            : videos.map((item) => {
                const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId
                return (
                  <VideoCard
                    key={videoId}
                    video={{
                      id: videoId,
                      snippet: item.snippet,
                      statistics: {},
                      contentDetails: {},
                    }}
                  />
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
