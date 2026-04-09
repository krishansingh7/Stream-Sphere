import { useState } from 'react'
import { useSelector } from 'react-redux'
import { postComment } from '../../services/youtube'
import { signInWithGoogle } from '../../services/firebase'
import toast from 'react-hot-toast'

export default function CommentForm({ videoId, onCommentPosted }) {
  const { user } = useSelector((s) => s.auth)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      await postComment({ videoId, text })
      setText('')
      toast.success('Comment posted!')
      onCommentPosted?.()
    } catch {
      toast.error('Failed to post comment. YouTube OAuth scope required.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="w-9 h-9 rounded-full bg-yt-bg3 flex-shrink-0" />
        <button
          onClick={() => signInWithGoogle().catch(() => toast.error('Sign in failed'))}
          className="flex items-center gap-2 px-4 py-1.5 border border-yt-blue text-yt-blue rounded-full text-sm font-medium hover:bg-blue-900/20 transition-colors"
        >
          Sign in to comment
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 py-4">
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-yt-red flex items-center justify-center text-white text-sm font-medium">
            {user.displayName?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Add a comment..."
          className="w-full bg-transparent border-b border-yt-border focus:border-yt-text outline-none text-sm text-yt-text placeholder-yt-text3 pb-1 transition-colors"
        />
        {focused && (
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => { setText(''); setFocused(false) }}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-yt-text hover:bg-yt-bg3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-yt-blue text-yt-bg hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Posting...' : 'Comment'}
            </button>
          </div>
        )}
      </div>
    </form>
  )
}
