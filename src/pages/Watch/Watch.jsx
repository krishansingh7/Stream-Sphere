import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSidebarOpen, setTheaterMode } from "../../store/slices/uiSlice";
import { useVideoDetails } from "../../hooks/api/useVideoDetails";
import { useUserData } from "../../context/UserDataContext";
import { toFirestoreVideo, getThumbnail } from "../../utils/formatters";
import VideoPlayer from "../../components/player/VideoPlayer";
import VideoInfo from "../../components/player/VideoInfo";
import CommentSection from "../../components/comments/CommentSection";
import RecommendedList from "../../components/player/RecommendedList";
import PlaylistQueue from "../../components/player/PlaylistQueue";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { usePlaylistItems } from "../../hooks/api/usePlaylistItems";
import { useCallback } from "react";

export default function Watch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const videoId = searchParams.get("v");
  const playlistId = searchParams.get("list");
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const theaterMode = useSelector((s) => s.ui.theaterMode);
  const { data: video, isLoading, isError } = useVideoDetails(videoId);
  const { addToHistory } = useUserData();

  const channelId  = video?.snippet?.channelId;
  const categoryId = video?.snippet?.categoryId;
  const title      = video?.snippet?.title;

  const [isPip, setIsPip] = useState(false);

  // Fetch playlist items if playlistId exists
  const { data: playlistData, isLoading: isPlaylistLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePlaylistItems(playlistId);
  const playlistItems = playlistData?.pages?.flatMap(p => p.items) || [];

  // Auto-route to the first video if URL has `list` but no `v`
  useEffect(() => {
    if (!videoId && playlistId && playlistItems.length > 0) {
      const firstVideoId = playlistItems[0].contentDetails?.videoId;
      if (firstVideoId) {
        setSearchParams({ v: firstVideoId, list: playlistId }, { replace: true });
      }
    }
  }, [videoId, playlistId, playlistItems, setSearchParams]);

  // Handle auto-play next video in playlist
  const handleVideoEnded = useCallback(() => {
    if (!playlistId || playlistItems.length === 0) return;
    const currentIndex = playlistItems.findIndex(
      (item) => item.contentDetails?.videoId === videoId
    );
    if (currentIndex >= 0 && currentIndex < playlistItems.length - 1) {
      const nextVideoId = playlistItems[currentIndex + 1].contentDetails?.videoId;
      if (nextVideoId) {
        setSearchParams({ v: nextVideoId, list: playlistId });
      }
    }
  }, [videoId, playlistId, playlistItems, setSearchParams]);

  useEffect(() => {
    dispatch(setSidebarOpen(false));
    dispatch(setTheaterMode(false));
  }, [dispatch]);
  const playerContainerRef = useRef(null);

  // Picture-in-Picture sticky player when scrolled past the video
  useEffect(() => {
    if (!playerContainerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsPip(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(playerContainerRef.current);
    return () => observer.disconnect();
  }, [videoId]);

  // Save to watch history when video loads and user is signed in
  useEffect(() => {
    if (video && user) addToHistory(toFirestoreVideo(video));
  }, [video?.id, user?.uid]);

  if (!videoId)   return <ErrorMessage message="No video selected." />;
  if (isLoading)  return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (isError || !video) return <ErrorMessage message="Failed to load video." />;

  return (
    <div className={`flex flex-col gap-0 max-w-[1800px] mx-auto ${theaterMode ? '' : 'lg:flex-row lg:gap-6 lg:px-4 lg:py-4'}`}>

      {/* ── LEFT: Player + Info + Comments ── */}
      <div className="flex-1 min-w-0">

        {/* Player */}
        <div ref={playerContainerRef} className={`w-full bg-black ${theaterMode ? '' : 'aspect-video lg:rounded-xl overflow-hidden'}`}>
          <div
            className={
              isPip
                ? "fixed bottom-20 right-3 md:bottom-6 md:right-6 w-[280px] sm:w-[340px] md:w-[360px] shadow-2xl z-[90] rounded-xl overflow-hidden group ring-1 ring-yt-border"
                : "w-full h-full lg:rounded-xl overflow-hidden"
            }
          >
            <VideoPlayer videoId={videoId} onEnded={handleVideoEnded} />
            {isPip && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-[60]"
                title="Back to top"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Info + Comments — padded on mobile */}
        <div className="px-3 sm:px-4 lg:px-0">
          <VideoInfo video={video} />
          <CommentSection
            videoId={videoId}
            commentCount={video.statistics?.commentCount}
          />
        </div>
      </div>

      {/* RIGHT: Recommended videos or Playlist Queue */}
      <div className={`w-full flex-shrink-0 px-3 sm:px-4 lg:px-0 pb-4 ${theaterMode ? 'lg:hidden' : 'lg:w-[400px] xl:w-[420px]'}`}>
        {playlistId && (
          <PlaylistQueue
            playlistId={playlistId}
            playlistItems={playlistItems}
            currentVideoId={videoId}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
        <RecommendedList
          videoId={videoId}
          channelId={channelId}
          categoryId={categoryId}
          title={title}
        />
      </div>
    </div>
  );
}
