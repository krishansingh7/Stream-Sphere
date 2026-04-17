import { useState, useEffect } from 'react'
import ReactPlayer from 'react-player/lazy'

export default function VideoPlayer({ videoId, onEnded }) {
  const [mounted, setMounted] = useState(false)

  // Wait until client is mounted to render player — fixes addEventListener null error
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      {mounted && (
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          controls
          playing
          onEnded={onEnded}
          fallback={<div className="w-full h-full bg-yt-bg2 animate-pulse" />}
          config={{
            youtube: {
              playerVars: {
                autoplay: 1,
                modestbranding: 1,
                rel: 0,
              },
            },
          }}
        />
      )}
    </div>
  )
}
