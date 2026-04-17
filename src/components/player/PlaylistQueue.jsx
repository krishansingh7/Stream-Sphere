import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getThumbnail } from "../../utils/formatters";

export default function PlaylistQueue({ playlistId, playlistItems, currentVideoId, isFetchingNextPage, hasNextPage, fetchNextPage }) {
  const navigate = useNavigate();
  const activeItemRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const currentIndex = playlistItems.findIndex((item) => item.contentDetails?.videoId === currentVideoId);
  const totalVideos = playlistItems.length > 0 ? playlistItems[0]?.snippet?.playlistId === playlistId ? playlistItems.length : 0 : 0; // The totalResults from API is not always available here easily unless passed, but we can just use length or omit. Let's just use items.length for now, or just show index.

  // Auto-scroll to active item on mount/change
  useEffect(() => {
    if (activeItemRef.current && isExpanded) {
      activeItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentVideoId, isExpanded]);

  return (
    <div className="flex flex-col bg-yt-bg border border-yt-border lg:rounded-xl overflow-hidden mb-4">
      {/* Header */}
      <div 
        className="px-4 py-3 bg-yt-bg2 flex items-center justify-between cursor-pointer hover:bg-yt-bg3 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-yt-text line-clamp-1">
            Playlist
          </h2>
          <p className="text-xs text-yt-text2 mt-1">
            {currentIndex >= 0 ? `${currentIndex + 1} / ${playlistItems.length}` : `${playlistItems.length} videos`}
          </p>
        </div>
        <button className="p-2 text-yt-text2 flex-shrink-0">
          <svg className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </button>
      </div>

      {/* Video List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto hide-scrollbar py-2 max-h-[400px] xl:max-h-[500px]">
        {playlistItems.map((item, idx) => {
          const videoId = item.contentDetails?.videoId;
          const isActive = videoId === currentVideoId;
          const thumbnail = getThumbnail(item.snippet?.thumbnails);

          return (
            <div
              key={item.id}
              ref={isActive ? activeItemRef : null}
              onClick={() => navigate(`/watch?v=${videoId}&list=${playlistId}`)}
              className={`flex gap-3 px-3 py-2 cursor-pointer transition-colors group ${
                isActive ? "bg-yt-bg3" : "hover:bg-yt-bg2"
              }`}
            >
              {/* Status / Index */}
              <div className="w-5 flex-shrink-0 flex items-center justify-center">
                {isActive ? (
                  <svg className="w-4 h-4 text-yt-text" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <span className="text-xs text-yt-text3">{idx + 1}</span>
                )}
              </div>

              {/* Thumbnail */}
              <div className="relative w-24 flex-shrink-0 aspect-video rounded-md overflow-hidden bg-yt-bg2">
                <img src={thumbnail} alt={item.snippet?.title} className="w-full h-full object-cover" loading="lazy" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-0.5">
                <p className={`text-sm font-medium line-clamp-2 leading-snug ${isActive ? "text-yt-text" : "text-yt-text"}`}>
                  {item.snippet?.title}
                </p>
                <p className="text-xs text-yt-text2 mt-1 truncate">{item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle}</p>
              </div>
            </div>
          );
        })}

        {/* Load More Trigger */}
        {hasNextPage && (
          <div className="py-4 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs font-medium text-yt-blue hover:text-blue-400 transition-colors"
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
