import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatViews, formatCount, formatSubscribers, timeAgo, toFirestoreVideo } from "../../utils/formatters";
import { useUserData } from "../../context/UserDataContext";
import { useChannelDetails } from "../../hooks/api/useChannelDetails";
import toast from "react-hot-toast";

// ── Tiny icon helpers ─────────────────────────────────────────────────────────
const ThumbUpIcon = ({ filled }) => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </svg>
);
const ThumbDownIcon = () => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
  </svg>
);
const ShareIcon = () => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
  </svg>
);
const SaveIcon = ({ filled }) => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d={filled ? "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" : "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"} />
  </svg>
);
const PlaylistAddIcon = ({ filled }) => (
  <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    {filled
      ? <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
      : <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm9-4v3h-2V3h-2v3h-3l4 4 4-4h-3z" />
    }
  </svg>
);

export default function VideoInfo({ video }) {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [expanded, setExpanded] = useState(false);

  const { likeVideo, unlikeVideo, isLiked, saveToWatchLater, removeFromWatchLater, isInWatchLater, addToPlaylist, removeFromPlaylist, isInPlaylist } = useUserData();

  const { snippet, statistics } = video;
  const videoId = video.id?.videoId || video.id;

  const liked = isLiked(videoId);
  const saved = isInWatchLater(videoId);
  const inPl  = isInPlaylist(videoId);

  const { data: channelData } = useChannelDetails(snippet?.channelId);
  const subscriberCount = channelData?.statistics?.subscriberCount;
  const channelAvatar   = channelData?.snippet?.thumbnails?.default?.url;

  const requireAuth = (cb) => { if (!user) { toast.error("Sign in first"); return; } cb(); };

  const handleLike = () => requireAuth(() => {
    if (liked) { unlikeVideo(videoId); toast.success("Removed from liked videos"); }
    else        { likeVideo(toFirestoreVideo(video)); toast.success("Added to liked videos"); }
  });
  const handleSave = () => requireAuth(() => {
    if (saved) { removeFromWatchLater(videoId); toast.success("Removed from Watch Later"); }
    else        { saveToWatchLater(toFirestoreVideo(video)); toast.success("Saved to Watch Later"); }
  });
  const handlePlaylist = () => requireAuth(() => {
    if (inPl) { removeFromPlaylist(videoId); toast.success("Removed from playlist"); }
    else       { addToPlaylist(toFirestoreVideo(video)); toast.success("Added to playlist"); }
  });
  const handleShare = () => {
    navigator.clipboard?.writeText(`https://youtube.com/watch?v=${videoId}`);
    toast.success("Link copied!");
  };

  const likeCount = parseInt(statistics?.likeCount || 0);

  return (
    <div className="mt-3 pb-1">

      {/* ── Title ── */}
      <h1 className="text-[15px] sm:text-[17px] font-semibold text-yt-text leading-snug">
        {snippet?.title}
      </h1>

      {/* ── Single row: Channel + Subscribe ··· Like | Dislike | Share | Save | Playlist ── */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">

        {/* Channel avatar */}
        <div
          className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-yt-bg3 cursor-pointer"
          onClick={() => navigate(`/channel/${snippet?.channelId}`)}
        >
          {channelAvatar
            ? <img src={channelAvatar} alt={snippet?.channelTitle} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-yt-text">{snippet?.channelTitle?.[0]?.toUpperCase()}</div>
          }
        </div>

        {/* Channel name + subs */}
        <div className="min-w-0 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/channel/${snippet?.channelId}`)}>
          <p className="text-sm font-medium text-yt-text leading-tight whitespace-nowrap">{snippet?.channelTitle}</p>
          {subscriberCount && (
            <p className="text-xs text-yt-text2 whitespace-nowrap">{formatSubscribers(subscriberCount)} subscribers</p>
          )}
        </div>

        {/* Subscribe */}
        <button
          onClick={() => requireAuth(() => toast.success("Subscribed!"))}
          className="flex-shrink-0 px-4 py-1.5 bg-yt-text text-yt-bg text-sm font-semibold rounded-full hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
        >
          Subscribe
        </button>

        {/* Spacer — pushes action pills to right on desktop */}
        <div className="flex-1 min-w-[12px]" />

        {/* Like | Dislike — joined pill */}
        <div className="flex items-center bg-yt-bg2 border border-yt-border rounded-full overflow-hidden flex-shrink-0">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 pl-3.5 pr-3 py-1.5 text-sm font-medium text-yt-text hover:bg-yt-bg3 transition-colors border-r border-yt-border"
          >
            <ThumbUpIcon filled={liked} />
            {likeCount > 0 && <span className="whitespace-nowrap">{formatCount(likeCount)}</span>}
          </button>
          <button className="px-3 py-1.5 text-yt-text hover:bg-yt-bg3 transition-colors flex-shrink-0">
            <ThumbDownIcon />
          </button>
        </div>

        {/* Share */}
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yt-bg2 border border-yt-border rounded-full text-sm font-medium text-yt-text hover:bg-yt-bg3 transition-colors flex-shrink-0 whitespace-nowrap">
          <ShareIcon /><span>Share</span>
        </button>

        {/* Save */}
        <button onClick={handleSave} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors flex-shrink-0 whitespace-nowrap ${saved ? "bg-yt-text text-yt-bg border-yt-text" : "bg-yt-bg2 text-yt-text border-yt-border hover:bg-yt-bg3"}`}>
          <SaveIcon filled={saved} /><span>{saved ? "Saved" : "Save"}</span>
        </button>

        {/* Add to Playlist */}
        <button onClick={handlePlaylist} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors flex-shrink-0 whitespace-nowrap ${inPl ? "bg-yt-blue text-white border-yt-blue hover:opacity-90" : "bg-yt-bg2 text-yt-text border-yt-border hover:bg-yt-bg3"}`}>
          <PlaylistAddIcon filled={inPl} /><span>{inPl ? "In Playlist" : "Add to Playlist"}</span>
        </button>

      </div>

      {/* ── Description box ── */}
      <div
        className="mt-3 bg-yt-bg2 rounded-xl p-3 cursor-pointer hover:bg-yt-bg3 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-yt-text mb-1 flex-wrap">
          <span>{formatViews(statistics?.viewCount)}</span>
          <span className="text-yt-text2 font-normal">{timeAgo(snippet?.publishedAt)}</span>
        </div>
        <p className={`text-sm text-yt-text2 leading-relaxed whitespace-pre-wrap break-words ${!expanded ? "line-clamp-2" : ""}`}>
          {snippet?.description}
        </p>
        {snippet?.description?.length > 120 && (
          <button className="text-sm font-semibold text-yt-text mt-1.5">
            {expanded ? "Show less" : "...more"}
          </button>
        )}
      </div>
    </div>
  );
}
