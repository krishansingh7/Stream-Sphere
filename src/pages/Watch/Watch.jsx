import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useVideoDetails } from '../../hooks/api/useVideoDetails'
import { useRelatedVideos } from '../../hooks/api/useRelatedVideos'
import { useWatchHistory } from '../../hooks/firebase/useWatchHistory'
import { toFirestoreVideo } from '../../utils/formatters'
import VideoPlayer from '../../components/player/VideoPlayer'
import VideoInfo from '../../components/player/VideoInfo'
import CommentSection from '../../components/comments/CommentSection'
import RecommendedList from '../../components/player/RecommendedList'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

export default function Watch() {
  const [searchParams] = useSearchParams()
  const videoId = searchParams.get('v')
  const { user } = useSelector((s) => s.auth)
  const { data: video, isLoading, isError } = useVideoDetails(videoId)
  const { addToHistory } = useWatchHistory()

  // Pass channel + category to related videos for better results
  const channelId = video?.snippet?.channelId
  const categoryId = video?.snippet?.categoryId
  const title = video?.snippet?.title

  // Auto-save to watch history
  useEffect(() => {
    if (video && user) addToHistory(toFirestoreVideo(video))
  }, [video?.id, user?.uid])

  if (!videoId) return <ErrorMessage message="No video selected." />
  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (isError || !video) return <ErrorMessage message="Failed to load video." />

  return (
    <div className="flex gap-6 px-4 py-4 max-w-[1800px] mx-auto">
      {/* ── LEFT: Player + Info + Comments ── */}
      <div className="flex-1 min-w-0 max-w-[calc(100%-420px)]">
        <VideoPlayer videoId={videoId} />
        <VideoInfo video={video} />
        <CommentSection
          videoId={videoId}
          commentCount={video.statistics?.commentCount}
        />
      </div>

      {/* ── RIGHT: Recommended videos ── */}
      <div className="w-[400px] flex-shrink-0 hidden lg:block">
        <RecommendedList
          videoId={videoId}
          channelId={channelId}
          categoryId={categoryId}
          title={title}
        />
      </div>
    </div>
  )
}
