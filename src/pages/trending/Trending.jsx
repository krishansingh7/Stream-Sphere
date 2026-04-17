import { useState, useCallback } from "react";
import { useTrendingVideos } from "../../hooks/api/useTrendingVideos";
import VideoCard from "../../components/video/VideoCard";
import VideoCardSkeleton from "../../components/video/VideoCardSkeleton";
import InfiniteScrollTrigger from "../../components/common/InfiniteScrollTrigger";
import ErrorMessage from "../../components/common/ErrorMessage";

const TREND_CATEGORIES = [
  { id: "0", label: "All" },
  { id: "10", label: "Music" },
  { id: "20", label: "Gaming" },
  { id: "25", label: "News" },
  { id: "17", label: "Sports" },
  { id: "28", label: "Technology" },
  { id: "24", label: "Entertainment" },
  { id: "23", label: "Comedy" },
];

export default function Trending() {
  const [categoryId, setCategoryId] = useState("0");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTrendingVideos(categoryId);

  const videos = data?.pages?.flatMap((p) => p.data.items) ?? [];

  const handleFetchNext = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isError)
    return <ErrorMessage message="Failed to load trending videos." />;

  return (
    <div className="py-2 sm:py-4 px-0 sm:px-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6 px-4 sm:px-0">
        <svg
          className="w-7 h-7 text-yt-red flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.2 3L15 5.2l2.6 2.6-9.6 9.6-4-4L1 16.4l4 4 11.6-11.6L19.2 11 21.4 8.8 17.2 3z" />
        </svg>
        <h1 className="text-2xl font-semibold text-yt-text">Trending</h1>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-3 mb-6 px-4 sm:px-0 overflow-x-auto hide-scrollbar">
        {TREND_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              categoryId === cat.id
                ? "bg-yt-text text-yt-bg"
                : "bg-yt-bg2 text-yt-text hover:bg-yt-hover border border-yt-border"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-10 mt-2">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))
          : videos.map((video) => (
              <VideoCard key={video.id?.videoId || video.id} video={video} />
            ))}
      </div>

      <InfiniteScrollTrigger
        onIntersect={handleFetchNext}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
