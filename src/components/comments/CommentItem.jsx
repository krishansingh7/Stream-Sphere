import { timeAgo, formatCount } from "../../utils/formatters";

export default function CommentItem({ comment }) {
  const { snippet } = comment.snippet.topLevelComment;

  return (
    <div className="flex gap-3 py-3">
      <div className="w-9 h-9 rounded-full bg-yt-bg3 flex-shrink-0 overflow-hidden">
        {snippet.authorProfileImageUrl ? (
          <img
            src={snippet.authorProfileImageUrl}
            alt={snippet.authorDisplayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-medium text-yt-text">
            {snippet.authorDisplayName?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-yt-text">
            {snippet.authorDisplayName}
          </span>
          <span className="text-xs text-yt-text3">
            {timeAgo(snippet.publishedAt)}
          </span>
        </div>

        <p className="text-sm text-yt-text leading-relaxed">
          {snippet.textOriginal}
        </p>

        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1.5 text-yt-text2 hover:text-yt-text text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
            </svg>

            {parseInt(snippet.likeCount) > 0 && formatCount(snippet.likeCount)}
          </button>
        </div>
      </div>
    </div>
  );
}
