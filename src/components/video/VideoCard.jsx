import React from "react";
import { useNavigate } from "react-router-dom";
import {
  formatViews,
  formatDuration,
  timeAgo,
  getThumbnail,
} from "../../utils/formatters";
import { useChannelAvatar } from "../../hooks/api/useChannelAvatar";

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  if (!video?.snippet) return null;

  const { snippet, statistics, contentDetails } = video;
  const videoId = video.id?.videoId || video.id;
  const thumbnail = getThumbnail(snippet.thumbnails);
  const duration = formatDuration(contentDetails?.duration);
  const views = formatViews(statistics?.viewCount);
  const ago = timeAgo(snippet.publishedAt);

  // ✅ Fetch real channel avatar — cached per channelId, deduped across cards
  const { data: channelAvatar } = useChannelAvatar(snippet.channelId);

  const handleClick = () => navigate(`/watch?v=${videoId}`);
  const handleChannelClick = (e) => {
    e.stopPropagation();
    navigate(`/channel/${snippet.channelId}`);
  };

  return (
    <div className="group flex flex-col cursor-pointer" onClick={handleClick}>
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-yt-bg2 mb-3">
        <img
          src={thumbnail}
          alt={snippet.title}
          className="w-full h-full object-cover group-hover:rounded-none transition-all duration-150"
          loading="lazy"
        />
        {duration && (
          <span className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {duration}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex gap-3">
        {/* Channel avatar — real image or initial fallback */}
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden cursor-pointer bg-yt-bg3"
          onClick={handleChannelClick}
        >
          {channelAvatar ? (
            <img
              src={channelAvatar}
              alt={snippet.channelTitle}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-yt-text">
              {snippet.channelTitle?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm font-medium text-yt-text line-clamp-2 leading-snug mb-1">
            {snippet.title}
          </h3>
          <p
            className="text-xs text-yt-text2 hover:text-yt-text cursor-pointer truncate"
            onClick={handleChannelClick}
          >
            {snippet.channelTitle}
          </p>
          <p className="text-xs text-yt-text2">
            {views} · {ago}
          </p>
        </div>

        {/* More options */}
        <button
          className="opacity-0 group-hover:opacity-100 self-start mt-0.5 p-1 rounded-full hover:bg-yt-bg3 text-yt-text2 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(VideoCard);
