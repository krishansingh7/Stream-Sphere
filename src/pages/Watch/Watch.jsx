import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useVideoDetails } from "../../hooks/api/useVideoDetails";
import { useUserData } from "../../context/UserDataContext";
import { toFirestoreVideo, getThumbnail } from "../../utils/formatters";
import VideoPlayer from "../../components/player/VideoPlayer";
import VideoInfo from "../../components/player/VideoInfo";
import CommentSection from "../../components/comments/CommentSection";
import RecommendedList from "../../components/player/RecommendedList";
import Spinner from "../../components/common/Spinner";
import ErrorMessage from "../../components/common/ErrorMessage";

export default function Watch() {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("v");
  const { user } = useSelector((s) => s.auth);
  const { data: video, isLoading, isError } = useVideoDetails(videoId);
  const { addToHistory } = useUserData();
  const [isTheater, setIsTheater] = useState(false);

  const channelId = video?.snippet?.channelId;
  const categoryId = video?.snippet?.categoryId;
  const title = video?.snippet?.title;
  const thumbnail = getThumbnail(video?.snippet?.thumbnails);

  const [isPip, setIsPip] = useState(false);
  const playerContainerRef = useRef(null);

  // Picture in Picture Observer
  useEffect(() => {
    if (!playerContainerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPip(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(playerContainerRef.current);
    return () => observer.disconnect();
  }, [videoId]);

  // Save to watch history when video loads and user is logged in
  useEffect(() => {
    if (video && user) addToHistory(toFirestoreVideo(video));
  }, [video?.id, user?.uid]);

  if (!videoId) return <ErrorMessage message="No video selected." />;
  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  if (isError || !video)
    return <ErrorMessage message="Failed to load video." />;

  return (
    <div className="flex flex-col lg:flex-row gap-6 px-0 sm:px-4 py-0 sm:py-4 max-w-[1800px] mx-auto">
      {/* ── LEFT: Player + Info + Comments ── */}
      <div className="flex-1 min-w-0 max-w-full lg:max-w-[calc(100%-420px)]">
        <div ref={playerContainerRef} className="w-full aspect-video">
           <div className={isPip ? "fixed bottom-6 right-6 w-[360px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 rounded-xl overflow-hidden group ring-1 ring-yt-border" : "w-full h-full"}>
              <VideoPlayer videoId={videoId} />
              {isPip && (
                <button 
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-[60]"
                  title="Back to top"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                </button>
              )}
           </div>
        </div>
        <VideoInfo video={video} />
        <CommentSection
          videoId={videoId}
          commentCount={video.statistics?.commentCount}
        />
      </div>

      {/* ── RIGHT: Recommended videos ── */}
      <div className="w-full lg:w-[400px] flex-shrink-0 px-2 sm:px-0">
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
