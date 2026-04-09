import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import Spinner from '../common/Spinner'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector((s) => s.auth)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-yt-bg">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  return children
}
