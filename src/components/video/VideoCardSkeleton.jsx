export default function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton aspect-video rounded-xl w-full" />
      <div className="flex gap-3">
        <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  )
}
