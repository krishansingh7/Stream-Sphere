import { useEffect, useRef } from 'react'
import Spinner from './Spinner'

export default function InfiniteScrollTrigger({ onIntersect, isFetchingNextPage, hasNextPage }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!hasNextPage) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onIntersect() },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onIntersect, hasNextPage])

  return (
    <div ref={ref} className="flex justify-center py-8">
      {isFetchingNextPage && <Spinner />}
    </div>
  )
}
