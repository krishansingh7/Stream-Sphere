import { signInWithGoogle } from '../../services/firebase'
import toast from 'react-hot-toast'

export default function SignInButton({ className = '' }) {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast.success('Signed in successfully!')
    } catch (err) {
      toast.error('Sign in failed. Please try again.')
    }
  }

  return (
    <button
      onClick={handleSignIn}
      className={`flex items-center gap-2 px-4 py-1.5 border border-yt-blue text-yt-blue rounded-full text-sm font-medium hover:bg-blue-900/20 transition-colors ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
      Sign in
    </button>
  )
}
