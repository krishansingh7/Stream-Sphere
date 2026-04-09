import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'
import { useSearchVideos } from '../../hooks/api/useSearchVideos'
import VideoCard from '../../components/video/VideoCard'
import VideoCardSkeleton from '../../components/video/VideoCardSkeleton'
import InfiniteScrollTrigger from '../../components/common/InfiniteScrollTrigger'
import ErrorMessage from '../../components/common/ErrorMessage'
import EmptyState from '../../components/common/EmptyState'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchVideos(query)

  const videos = data?.pages?.flatMap((p) => p.data.items) ?? []

  const handleFetchNext = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!query) return <EmptyState emoji="🔍" title="Search for something" subtitle="Type in the search bar to find videos" />
  if (isError) return <ErrorMessage message="Search failed. You may have exceeded your API quota." />

  return (
    <div className="px-6 py-4">
      <p className="text-yt-text2 text-sm mb-4">
        {!isLoading && `Results for "${query}"`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : videos.map((video) => <VideoCard key={video.id?.videoId || video.id} video={video} />)
        }
      </div>

      {!isLoading && videos.length === 0 && (
        <EmptyState emoji="😕" title={`No results for "${query}"`} subtitle="Try different keywords" />
      )}

      <InfiniteScrollTrigger
        onIntersect={handleFetchNext}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  )
}
