import React, { useEffect, useRef, useState } from 'react'
import { useSearchVideos } from '../../hooks/api/useSearchVideos'
import ReactPlayer from 'react-player/lazy'
import Spinner from '../../components/common/Spinner'

export default function Shorts() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSearchVideos('#shorts')
  const videos = data?.pages?.flatMap(p => p.data.items) ?? []
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    let timeoutId;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number(entry.target.dataset.index);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setActiveIdx(idx), 50);
          }
        });
      },
      { threshold: 0.6 }
    );

    const elements = document.querySelectorAll('.short-container');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [videos.length]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 100;
    if (bottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }

  if (isLoading) return <div className="flex justify-center flex-1 items-center h-full"><Spinner size="lg" /></div>
  
  return (
    <div 
      className="flex flex-col items-center w-full h-[calc(100vh-56px)] overflow-y-scroll snap-y snap-mandatory bg-yt-bg hide-scrollbar scroll-smooth"
      onScroll={handleScroll}
    >
      {videos.map((vid, idx) => (
         <div data-index={idx} key={vid.id + idx} className="short-container flex-shrink-0 w-full max-w-[450px] h-full snap-start snap-always py-4 relative">
            <div className="w-full h-full bg-black sm:rounded-2xl overflow-hidden relative shadow-lg">
               <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${vid.id}`}
                  width="100%"
                  height="100%"
                  playing={idx === activeIdx} // Autoplay active video only
                  controls={true}
                  loop={true}
                  style={{ objectFit: 'cover' }}
               />
               <div className="absolute bottom-16 left-4 right-16 text-white z-10 pointer-events-none drop-shadow-md bg-gradient-to-t from-black/80 to-transparent p-4 rounded-xl">
                 <h2 className="font-bold text-[15px] line-clamp-2">{vid.snippet?.title}</h2>
                 <p className="text-sm opacity-90">{vid.snippet?.channelTitle}</p>
               </div>
            </div>
         </div>
      ))}
      {isFetchingNextPage && <div className="py-10 snap-start flex justify-center w-full min-h-[100px]"><Spinner /></div>}
    </div>
  )
}
