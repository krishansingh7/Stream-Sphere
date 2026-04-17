import { useState } from "react";
import { timeAgo, formatCount } from "../../utils/formatters";

const Avatar = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yt-text3 bg-yt-bg3 p-1">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

export default function CommentItem({ comment }) {
  const { snippet } = comment.snippet.topLevelComment;
  const replyCount = comment.snippet.totalReplyCount || 0;
  const replies = comment.replies?.comments || [];
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-yt-bg3 flex-shrink-0 overflow-hidden cursor-pointer">
        <Avatar src={snippet.authorProfileImageUrl} alt={snippet.authorDisplayName} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-bold text-yt-text cursor-pointer hover:bg-yt-bg2 px-1 -ml-1 rounded">
            {snippet.authorDisplayName}
          </span>
          <span className="text-[12px] text-yt-text3 hover:text-yt-text cursor-pointer">
            {timeAgo(snippet.publishedAt)}
          </span>
        </div>

        <p className="text-sm text-yt-text leading-relaxed whitespace-pre-wrap break-words">
          {snippet.textOriginal}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-2 mb-2">
          <button className="flex items-center gap-1.5 text-yt-text hover:bg-yt-bg3 p-1.5 -ml-1.5 rounded-full transition-colors">
            {/* Outline Thumbs Up */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span className="text-xs text-yt-text2 font-medium">
              {parseInt(snippet.likeCount) > 0 && formatCount(snippet.likeCount)}
            </span>
          </button>
          <button className="flex items-center text-yt-text hover:bg-yt-bg3 p-1.5 rounded-full transition-colors">
            {/* Outline Thumbs Down */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
            </svg>
          </button>
          <button className="text-xs font-bold text-yt-text px-3 py-1.5 hover:bg-yt-bg3 rounded-full transition-colors">
            Reply
          </button>
        </div>

        {/* Replies Toggle */}
        {replyCount > 0 && (
          <div className="mt-1 -ml-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-b-2 border-l-2 border-yt-text3/40 rounded-bl-xl ml-2 mb-2"></div>
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-2 text-sm font-bold text-yt-blue hover:bg-blue-900/20 px-4 py-1.5 rounded-full transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                </svg>
                {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
              </button>
            </div>

            {/* Replies List */}
            {showReplies && replies.length > 0 && (
              <div className="mt-2 ml-10 flex flex-col gap-4">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-yt-bg3 flex-shrink-0 overflow-hidden cursor-pointer">
                      <Avatar src={reply.snippet.authorProfileImageUrl} alt={reply.snippet.authorDisplayName} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-yt-text cursor-pointer hover:bg-yt-bg2 px-1 -ml-1 rounded">
                          {reply.snippet.authorDisplayName}
                        </span>
                        <span className="text-[11px] text-yt-text3 hover:text-yt-text cursor-pointer">
                          {timeAgo(reply.snippet.publishedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-yt-text leading-relaxed whitespace-pre-wrap break-words">
                        {reply.snippet.textOriginal}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <button className="flex items-center gap-1.5 text-yt-text hover:bg-yt-bg3 p-1 -ml-1 rounded-full transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                          <span className="text-[11px] text-yt-text2 font-medium">
                            {parseInt(reply.snippet.likeCount) > 0 && formatCount(reply.snippet.likeCount)}
                          </span>
                        </button>
                        <button className="flex items-center text-yt-text hover:bg-yt-bg3 p-1 rounded-full transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
