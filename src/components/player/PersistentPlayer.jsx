import { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import ReactPlayer from "react-player/lazy";
import {
  closePlayer,
  setPlaying,
  hideMiniPlayer,
} from "../../store/slices/playerSlice";
import { useMediaSession } from "../../hooks/utils/useMediaSession";

export default function PersistentPlayer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { videoId, title, channelTitle, thumbnail, isPlaying } = useSelector(
    (s) => s.player,
  );

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null }); // null = default bottom-right
  const dragOffset = useRef({ x: 0, y: 0 });
  const playerRef = useRef(null);

  // Integrate Media Session API + background audio keepalive
  useMediaSession(
    { videoId, title, channelTitle, thumbnail, isPlaying },
    {
      // Wire up next/prev if you have a queue in the future
      onNext: undefined,
      onPrev: undefined,
    },
  );

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Draggable mini player ────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (isMobile) return; // Completely disable drag logic on mobile
    if (e.target.closest("button")) return; // don't drag when clicking buttons
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      setPos({
        x: Math.max(
          0,
          Math.min(window.innerWidth - 300, e.clientX - dragOffset.current.x),
        ),
        y: Math.max(
          0,
          Math.min(window.innerHeight - 170, e.clientY - dragOffset.current.y),
        ),
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  // ── Go back to watch page ────────────────────────────────────────────
  const handleExpand = () => {
    dispatch(hideMiniPlayer());
    navigate(`/watch?v=${videoId}`);
  };

  // Nothing to render if no video loaded
  if (!videoId || !mounted) return null;

  // We determine if we should show the mini player purely based on the route
  const onWatchPage = location.pathname === "/watch";
  const watchingThisOne = searchParams.get("v") === videoId;
  const isMiniActive = !onWatchPage || !watchingThisOne;

  if (!isMiniActive) return null;

  const style = isMobile
    ? { bottom: 0, left: 0, right: 0, width: "100%" }
    : pos.x !== null
      ? { left: pos.x, top: pos.y, bottom: "auto", right: "auto" }
      : { bottom: "80px", right: "24px" };

  return (
    <div
      className={`fixed z-[200] overflow-hidden shadow-2xl border border-yt-border bg-yt-bg2 select-none
        transition-all duration-300 md:rounded-xl md:w-72 flex md:block
        ${isMiniActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
      style={{
        ...style,
        cursor: isDragging ? "grabbing" : isMobile ? "pointer" : "grab",
      }}
      onMouseDown={onMouseDown}
      onClick={() => isMobile && handleExpand()} // Open freely on mobile tap
    >
      {/* ── Video ── */}
      <div className="relative w-[130px] aspect-video md:w-full md:aspect-video bg-black flex-shrink-0">
        <ReactPlayer
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={false}
          onPlay={() => dispatch(setPlaying(true))}
          onPause={() => dispatch(setPlaying(false))}
          config={{
            youtube: { playerVars: { autoplay: 1, rel: 0, modestbranding: 1 } },
          }}
        />

        {/* Overlay buttons — shown on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 hover:bg-black/40 transition-colors group">
          {/* Play / Pause */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setPlaying(!isPlaying));
            }}
            className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Top-right: Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(closePlayer());
          }}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
          title="Close"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        {/* Top-left: Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleExpand();
          }}
          className="absolute top-2 left-2 z-10 w-7 h-7 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white transition-colors"
          title="Expand"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          </svg>
        </button>
      </div>

      {/* ── Info bar ── */}
      <div
        className="flex-1 flex items-center gap-2 px-3 py-2 bg-yt-bg2 cursor-pointer hover:bg-yt-bg3 transition-colors min-w-0"
        onClick={(e) => {
          if (!isMobile) handleExpand();
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium text-yt-text truncate mt-1 md:mt-0">
            {title}
          </p>
          <p className="text-[10px] md:text-[11px] text-yt-text2 truncate">
            {channelTitle}
          </p>
        </div>
        {/* Play/pause in info bar too */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(setPlaying(!isPlaying));
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-yt-hover text-yt-text flex-shrink-0 transition-colors"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(closePlayer());
          }}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-yt-hover text-yt-text2 flex-shrink-0 transition-colors"
          title="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
