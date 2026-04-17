export default function EmptyState({ emoji = '📭', title = 'Nothing here yet', subtitle = '' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 gap-3">
      <span className="text-6xl">{emoji}</span>
      <h3 className="text-lg font-medium text-yt-text">{title}</h3>
      {subtitle && <p className="text-yt-text2 text-sm text-center max-w-xs">{subtitle}</p>}
    </div>
  )
}
