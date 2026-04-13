import { useState } from 'react'
import { useComments } from '../../hooks/api/useComments'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import InfiniteScrollTrigger from '../common/InfiniteScrollTrigger'
import Spinner from '../common/Spinner'
import { formatCount } from '../../utils/formatters'

export default function CommentSection({ videoId, commentCount }) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useComments(videoId)

  const comments = data?.pages?.flatMap((p) => p.data.items) ?? []
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mt-4 md:mt-6">
      {/* ── MOBILE TEASER BOX ── */}
      <div 
        className={`md:hidden bg-yt-bg2 px-4 py-3 rounded-xl cursor-pointer hover:bg-yt-bg3 transition-colors mb-4 ${isExpanded ? 'hidden' : 'block'}`}
        onClick={() => setIsExpanded(true)}
        title="Expand comments"
      >
        <h3 className="text-sm font-bold text-yt-text mb-2">
          Comments <span className="text-yt-text2 font-normal ml-1">{commentCount ? formatCount(parseInt(commentCount)) : ''}</span>
        </h3>
        {comments[0] ? (
          <div className="flex gap-3 items-center">
            <img 
              src={comments[0].snippet.topLevelComment.snippet.authorProfileImageUrl} 
              alt="author" 
              className="w-6 h-6 rounded-full object-cover" 
              referrerPolicy="no-referrer"
            />
            <p className="text-xs text-yt-text line-clamp-1 flex-1">
               {comments[0].snippet.topLevelComment.snippet.textDisplay.replace(/<[^>]+>/g, '') || comments[0].snippet.topLevelComment.snippet.textOriginal}
            </p>
            <svg className="w-5 h-5 text-yt-text flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 15.41l-5-5L8.41 9 12 12.58 15.59 9 17 10.41z"/>
            </svg>
          </div>
        ) : (
          <div className="text-xs text-yt-text2 font-medium">Add a comment...</div>
        )}
      </div>

      {/* ── FULL COMMENT SECTION ── */}
      <div className={`${isExpanded ? 'block' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-yt-text">
            {commentCount
              ? `${formatCount(parseInt(commentCount)).toLocaleString()} Comments`
              : "Comments"}
          </h3>
          <button 
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-yt-bg3 text-yt-text transition-colors"
            onClick={() => setIsExpanded(false)}
            title="Close comments"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        <CommentForm videoId={videoId} onCommentPosted={refetch} />

        <div className="divide-y divide-yt-border/30 mt-4">
          {isLoading ? (
            <div className="py-8">
              <Spinner />
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        <InfiniteScrollTrigger
          onIntersect={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}
