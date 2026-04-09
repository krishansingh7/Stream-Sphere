import { useWatchLater } from '../../hooks/firebase/useWatchLater'
import VideoRow from '../../components/video/VideoRow'
import EmptyState from '../../components/common/EmptyState'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function WatchLater() {
  const { watchLater, isLoading, removeFromWatchLater } = useWatchLater()

  return (
    <div className="px-6 py-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-yt-text mb-6">Watch later</h1>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : watchLater.length === 0 ? (
        <EmptyState
          emoji="🕒"
          title="No saved videos"
          subtitle="Save videos to watch them later"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {watchLater.map((video) => (
            <VideoRow
              key={video.id}
              video={video}
              onRemove={(id) => {
                removeFromWatchLater(id)
                toast.success('Removed from Watch Later')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
