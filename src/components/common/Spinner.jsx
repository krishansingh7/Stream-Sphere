const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

export default function Spinner({ size = 'md' }) {
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-2 border-yt-border border-t-white rounded-full animate-spin`} />
    </div>
  )
}
