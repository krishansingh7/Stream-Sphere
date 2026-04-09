export default function VoiceSearchModal({ listening, onClose }) {
  return (
    <div className="fixed inset-0 bg-yt-bg z-50 flex flex-col items-center justify-center gap-8">
      <p className="text-yt-text2 text-xl">
        {listening ? 'Listening...' : 'Initializing...'}
      </p>
      <div className="relative flex items-center justify-center">
        {listening && (
          <>
            <div className="absolute w-24 h-24 rounded-full bg-red-500/20 pulse-ring" />
            <div className="absolute w-20 h-20 rounded-full bg-red-500/30 pulse-ring" style={{ animationDelay: '0.3s' }} />
          </>
        )}
        <div className="relative w-16 h-16 rounded-full bg-yt-red flex items-center justify-center z-10">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-yt-text2 hover:text-yt-text text-sm underline"
      >
        Cancel
      </button>
    </div>
  )
}
