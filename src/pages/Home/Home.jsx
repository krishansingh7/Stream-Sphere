import { useState, useCallback } from 'react'
import { useTrendingVideos } from '../../hooks/api/useTrendingVideos'
import VideoCard from '../../components/video/VideoCard'
import VideoCardSkeleton from '../../components/video/VideoCardSkeleton'
import CategoryFilter from '../../components/video/CategoryFilter'
import InfiniteScrollTrigger from '../../components/common/InfiniteScrollTrigger'
import ErrorMessage from '../../components/common/ErrorMessage'

export default function Home() {
  const [categoryId, setCategoryId] = useState('0')

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrendingVideos(categoryId)

  const videos = data?.pages?.flatMap((p) => p.data.items) ?? []

  const handleFetchNext = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isError) return <ErrorMessage message="Failed to load videos. Check your API key." />

  return (
    <div>
      <CategoryFilter onSelect={setCategoryId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-10 px-0 sm:px-6 py-6">
        {isLoading
          ? Array.from({ length: 15 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : videos.map((video) => <VideoCard key={video.id?.videoId || video.id} video={video} />)
        }
      </div>

      <InfiniteScrollTrigger
        onIntersect={handleFetchNext}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  )
}
