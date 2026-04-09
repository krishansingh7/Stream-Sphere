import { useEffect, useRef } from 'react'

export const useIntersectionObserver = (callback, options = {}) => {
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback()
    }, { threshold: 0.1, ...options })

    const el = ref.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [callback])

  return ref
}
