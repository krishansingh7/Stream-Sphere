import { useComments } from '../../hooks/api/useComments'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import InfiniteScrollTrigger from '../common/InfiniteScrollTrigger'
import Spinner from '../common/Spinner'

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

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-yt-text mb-4">
        {commentCount ? `${parseInt(commentCount).toLocaleString()} Comments` : 'Comments'}
      </h3>

      <CommentForm videoId={videoId} onCommentPosted={refetch} />

      <div className="divide-y divide-yt-border/30">
        {isLoading ? (
          <div className="py-8"><Spinner /></div>
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
  )
}
