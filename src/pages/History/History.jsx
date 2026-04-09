import { useWatchHistory } from '../../hooks/firebase/useWatchHistory'
import VideoRow from '../../components/video/VideoRow'
import EmptyState from '../../components/common/EmptyState'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function History() {
  const { history, isLoading, removeFromHistory, clearHistory } = useWatchHistory()

  const handleClear = () => {
    clearHistory()
    toast.success('History cleared')
  }

  return (
    <div className="px-6 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-yt-text">Watch history</h1>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-sm text-yt-blue hover:underline"
          >
            Clear all history
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : history.length === 0 ? (
        <EmptyState
          emoji="🕐"
          title="No watch history"
          subtitle="Videos you watch will appear here"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {history.map((video) => (
            <VideoRow
              key={video.id}
              video={video}
              onRemove={(id) => {
                removeFromHistory(id)
                toast.success('Removed from history')
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
