import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  formatViews,
  formatCount,
  formatSubscribers,
  timeAgo,
  toFirestoreVideo,
} from "../../utils/formatters";
import { useUserData } from "../../context/UserDataContext";
import { useChannelDetails } from "../../hooks/api/useChannelDetails";
import { signInWithGoogle } from "../../services/firebase";
import toast from "react-hot-toast";

export default function VideoInfo({ video }) {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [expanded, setExpanded] = useState(false);

  const {
    likeVideo,
    unlikeVideo,
    isLiked,
    saveToWatchLater,
    removeFromWatchLater,
    isInWatchLater,
    addToPlaylist,
    removeFromPlaylist,
    isInPlaylist,
  } = useUserData();

  const { snippet, statistics } = video;
  const videoId = video.id?.videoId || video.id;

  const liked = isLiked(videoId);
  const saved = isInWatchLater(videoId);
  const inPl = isInPlaylist(videoId);

  const { data: channelData } = useChannelDetails(snippet?.channelId);
  const subscriberCount = channelData?.statistics?.subscriberCount;
  const channelAvatar = channelData?.snippet?.thumbnails?.default?.url;

  const requireAuth = (cb) => {
    if (!user) {
      toast.error("Sign in first");
      return;
    }
    cb();
  };

  const handleLike = () =>
    requireAuth(() => {
      const fv = toFirestoreVideo(video);
      if (liked) {
        unlikeVideo(videoId);
        toast.success("Removed from liked videos");
      } else {
        likeVideo(fv);
        toast.success("Added to liked videos");
      }
    });

  const handleSave = () =>
    requireAuth(() => {
      const fv = toFirestoreVideo(video);
      if (saved) {
        removeFromWatchLater(videoId);
        toast.success("Removed from Watch Later");
      } else {
        saveToWatchLater(fv);
        toast.success("Saved to Watch Later");
      }
    });

  const handlePlaylist = () =>
    requireAuth(() => {
      const fv = toFirestoreVideo(video);
      if (inPl) {
        removeFromPlaylist(videoId);
        toast.success("Removed from playlist");
      } else {
        addToPlaylist(fv);
        toast.success("Added to playlist");
      }
    });

  const handleShare = () => {
    navigator.clipboard?.writeText(`https://youtube.com/watch?v=${videoId}`);
    toast.success("Link copied!");
  };

  const likeCount = parseInt(statistics?.likeCount || 0);

  return (
    <div className="mt-3">
      <h1 className="text-lg font-semibold text-yt-text leading-snug">
        {snippet?.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        {/* Channel */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer bg-yt-bg3"
            onClick={() => navigate(`/channel/${snippet?.channelId}`)}
          >
            {channelAvatar ? (
              <img
                src={channelAvatar}
                alt={snippet?.channelTitle}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-yt-text">
                {snippet?.channelTitle?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/channel/${snippet?.channelId}`)}
          >
            <p className="text-sm font-medium text-yt-text leading-tight">
              {snippet?.channelTitle}
            </p>
            {subscriberCount && (
              <p className="text-xs text-yt-text2">
                {formatSubscribers(subscriberCount)} subscribers
              </p>
            )}
          </div>
          <button
            onClick={() => requireAuth(() => toast.success("Subscribed!"))}
            className="ml-2 px-4 py-2 bg-yt-text text-yt-bg text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
          >
            Subscribe
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Like + Dislike */}
          <div className="flex items-center bg-yt-bg2 rounded-full overflow-hidden">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 pl-4 pr-3 py-2 text-sm font-medium transition-colors border-r border-yt-border ${liked ? "text-yt-text bg-yt-hover" : "text-yt-text hover:bg-yt-hover"}`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
              {likeCount > 0 && <span>{formatCount(likeCount)}</span>}
            </button>
            <button className="px-3 py-2 text-yt-text hover:bg-yt-hover transition-colors">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
              </svg>
            </button>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-yt-bg2 rounded-full text-sm font-medium text-yt-text hover:bg-yt-hover transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            Share
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${saved ? "bg-yt-text text-yt-bg" : "bg-yt-bg2 text-yt-text hover:bg-yt-hover"}`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d={
                  saved
                    ? "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
                    : "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
                }
              />
            </svg>
            {saved ? "Saved" : "Save"}
          </button>

          {/* Playlist */}
          <button
            onClick={handlePlaylist}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${inPl ? "bg-yt-blue text-white hover:bg-blue-400" : "bg-yt-bg2 text-yt-text hover:bg-yt-hover"}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              {inPl ? (
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              ) : (
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm9-4v3h-2V3h-2v3h-3l4 4 4-4h-3z" />
              )}
            </svg>
            {inPl ? "In Playlist" : "Add to Playlist"}
          </button>
        </div>
      </div>

      {/* Description */}
      <div
        className="mt-3 bg-yt-bg2 rounded-xl p-3 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <p className="text-sm font-medium text-yt-text mb-1">
          {formatViews(statistics?.viewCount)} &nbsp;·&nbsp;{" "}
          {timeAgo(snippet?.publishedAt)}
        </p>
        <p
          className={`text-sm text-yt-text leading-relaxed whitespace-pre-wrap ${!expanded ? "line-clamp-2" : ""}`}
        >
          {snippet?.description}
        </p>
        {snippet?.description?.length > 120 && (
          <button className="text-sm font-semibold text-yt-text mt-1">
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  );
}
