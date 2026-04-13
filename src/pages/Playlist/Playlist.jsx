import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player/lazy";
import { useUserData } from "../../context/UserDataContext";
import { formatViews, formatDuration, timeAgo } from "../../utils/formatters";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

export default function Playlist() {
  const navigate = useNavigate();
  const { playlist, removeFromPlaylist, clearPlaylist } = useUserData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [mounted, setMounted] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (playlist.length > 0 && currentIndex >= playlist.length)
      setCurrentIndex(0);
  }, [playlist.length]);

  const current = playlist[currentIndex];

  const goTo = useCallback((idx) => {
    setCurrentIndex(idx);
    setIsPlaying(true);
  }, []);

  const goNext = useCallback(() => {
    if (isShuffle) goTo(Math.floor(Math.random() * playlist.length));
    else goTo(currentIndex < playlist.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, playlist.length, isShuffle]);

  const goPrev = useCallback(() => {
    if (isShuffle) goTo(Math.floor(Math.random() * playlist.length));
    else goTo(currentIndex > 0 ? currentIndex - 1 : playlist.length - 1);
  }, [currentIndex, playlist.length, isShuffle]);

  const handleEnded = useCallback(() => {
    if (isRepeat) {
      setIsPlaying(true);
      return;
    }
    if (currentIndex < playlist.length - 1 || isShuffle) goNext();
    else setIsPlaying(false);
  }, [currentIndex, playlist.length, isRepeat, isShuffle, goNext]);

  if (playlist.length === 0) {
    return (
      <EmptyState
        emoji="🎵"
        title="Your playlist is empty"
        subtitle="Add videos from the watch page"
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-56px)] min-h-0 overflow-hidden">
      {/* Player */}
      <div className="flex-none lg:flex-1 flex flex-col bg-black min-w-0 border-b lg:border-b-0 border-yt-border">
        <div className="relative w-full lg:flex-1 aspect-video lg:aspect-auto bg-black">
          {mounted && current && (
            <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${current.id}`}
              width="100%"
              height="100%"
              controls
              playing={isPlaying}
              onEnded={handleEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              config={{ youtube: { playerVars: { autoplay: 1, rel: 0 } } }}
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          )}
        </div>
        {current && (
          <div className="px-4 py-3 bg-yt-bg border-t border-yt-border flex-none">
            <p className="text-sm font-semibold text-yt-text line-clamp-1">
              {current.title}
            </p>
            <p className="text-xs text-yt-text2 mt-0.5">
              {current.channelTitle} · {formatViews(current.viewCount)}
            </p>
          </div>
        )}
        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-yt-bg border-t border-yt-border flex-none">
          <button
            onClick={() => setIsShuffle((p) => !p)}
            title="Shuffle"
            className={`p-2 rounded-full transition-colors ${isShuffle ? "text-yt-blue bg-blue-900/20" : "text-yt-text2 hover:bg-yt-bg3"}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
            </svg>
          </button>
          <button
            onClick={goPrev}
            disabled={playlist.length <= 1}
            className="p-2 rounded-full text-yt-text hover:bg-yt-bg3 transition-colors disabled:opacity-30"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="w-14 h-14 bg-yt-text text-yt-bg rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={goNext}
            disabled={playlist.length <= 1}
            className="p-2 rounded-full text-yt-text hover:bg-yt-bg3 transition-colors disabled:opacity-30"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
          <button
            onClick={() => setIsRepeat((p) => !p)}
            title="Repeat"
            className={`p-2 rounded-full transition-colors ${isRepeat ? "text-yt-blue bg-blue-900/20" : "text-yt-text2 hover:bg-yt-bg3"}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Playlist sidebar */}
      <div className="flex-1 lg:flex-none lg:w-[380px] flex flex-col bg-yt-bg border-l border-yt-border min-h-0 overflow-hidden pb-[60px] md:pb-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-yt-border flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-yt-text">
              My Playlist
            </h2>
            <p className="text-xs text-yt-text2">
              {playlist.length} videos · {currentIndex + 1}/{playlist.length}{" "}
              playing
            </p>
          </div>
          <button
            onClick={() => {
              clearPlaylist();
              toast.success("Playlist cleared");
            }}
            className="text-xs text-yt-text2 hover:text-yt-red transition-colors px-3 py-1.5 rounded-lg hover:bg-yt-bg3"
          >
            Clear all
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {playlist.map((video, idx) => (
            <div
              key={video.id}
              onClick={() => goTo(idx)}
              className={`flex gap-3 px-3 py-2 cursor-pointer transition-colors group ${idx === currentIndex ? "bg-yt-bg3 border-l-2 border-yt-red" : "hover:bg-yt-bg2 border-l-2 border-transparent"}`}
            >
              <div className="w-5 flex-shrink-0 flex items-center justify-center">
                {idx === currentIndex ? (
                  <div className="flex gap-0.5 items-end h-4">
                    <div
                      className={`w-1 bg-yt-red rounded-sm ${isPlaying ? "animate-bounce" : ""}`}
                      style={{ height: "14px", animationDelay: "0ms" }}
                    />
                    <div
                      className={`w-1 bg-yt-red rounded-sm ${isPlaying ? "animate-bounce" : ""}`}
                      style={{ height: "10px", animationDelay: "150ms" }}
                    />
                    <div
                      className={`w-1 bg-yt-red rounded-sm ${isPlaying ? "animate-bounce" : ""}`}
                      style={{ height: "14px", animationDelay: "300ms" }}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-yt-text3">{idx + 1}</span>
                )}
              </div>
              <div className="relative w-24 flex-shrink-0 aspect-video rounded-md overflow-hidden bg-yt-bg2">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {video.duration && (
                  <span className="absolute bottom-0.5 right-0.5 bg-black/85 text-white text-[10px] px-1 rounded">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <p
                  className={`text-xs font-medium line-clamp-2 leading-snug ${idx === currentIndex ? "text-yt-text" : "text-yt-text2"}`}
                >
                  {video.title}
                </p>
                <p className="text-[11px] text-yt-text3 mt-0.5 truncate">
                  {video.channelTitle}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromPlaylist(video.id);
                  toast.success("Removed");
                }}
                className="opacity-0 group-hover:opacity-100 self-center p-1 rounded-full hover:bg-yt-hover text-yt-text3 transition-all flex-shrink-0"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
