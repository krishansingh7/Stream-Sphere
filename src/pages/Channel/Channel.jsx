import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChannelDetails } from '../../hooks/api/useChannelDetails'
import { useChannelVideosInfinite } from '../../hooks/api/useChannelVideosInfinite'
import { formatSubscribers, formatViews, formatDuration, timeAgo, getThumbnail } from '../../utils/formatters'
import VideoCardSkeleton from '../../components/video/VideoCardSkeleton'
import Spinner from '../../components/common/Spinner'
import ErrorMessage from '../../components/common/ErrorMessage'

// ─── Channel Video Card (compact, channel-page style) ────────────────────────
function ChannelVideoCard({ item }) {
  const navigate = useNavigate()
  const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId
  if (!videoId || !item.snippet) return null

  const thumbnail = getThumbnail(item.snippet.thumbnails)
  const duration = formatDuration(item.contentDetails?.duration)
  const views = formatViews(item.statistics?.viewCount)
  const ago = timeAgo(item.snippet.publishedAt)

  return (
    <div
      className="group flex flex-col cursor-pointer"
      onClick={() => navigate(`/watch?v=${videoId}`)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-yt-bg2 mb-2">
        <img
          src={thumbnail}
          alt={item.snippet.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        {duration && (
          <span className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-yt-text line-clamp-2 leading-snug mb-1">
          {item.snippet.title}
        </h3>
        <p className="text-xs text-yt-text2">
          {views} · {ago}
        </p>
      </div>
    </div>
  )
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
        ${active ? 'text-yt-text' : 'text-yt-text2 hover:text-yt-text'}`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yt-text rounded-t-full" />
      )}
    </button>
  )
}

// ─── Main Channel Page ────────────────────────────────────────────────────────
export default function Channel() {
  const { channelId } = useParams()
  const [activeTab, setActiveTab] = useState('videos')
  const [subscribed, setSubscribed] = useState(false)
  const observerRef = useRef(null)

  const { data: channel, isLoading: channelLoading, isError } = useChannelDetails(channelId)
  const {
    data,
    isLoading: videosLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelVideosInfinite(channelId)

  const videos = data?.pages?.flatMap((p) => p.items) ?? []

  // Intersection Observer for infinite scroll
  const loaderRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
      })
      if (node) observerRef.current.observe(node)
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  if (channelLoading)
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  if (isError || !channel) return <ErrorMessage message="Channel not found." />

  const { snippet, statistics, brandingSettings } = channel
  const banner = brandingSettings?.image?.bannerExternalUrl
  const avatar = snippet?.thumbnails?.high?.url || snippet?.thumbnails?.default?.url
  const handle = snippet?.customUrl || ''

  return (
    <div className="min-h-screen">
      {/* ── Banner ── */}
      <div className="w-full h-24 sm:h-36 md:h-48 bg-yt-bg2 overflow-hidden">
        {banner ? (
          <img
            src={`${banner}=w2560-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj`}
            alt="Channel banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-yt-bg2 to-yt-bg3" />
        )}
      </div>

      {/* ── Channel Info Header ── */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-yt-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 max-w-6xl">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex-shrink-0 overflow-hidden bg-yt-bg3 ring-2 ring-yt-border">
            {avatar ? (
              <img src={avatar} alt={snippet.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-yt-text bg-gradient-to-br from-yt-red to-red-700">
                {snippet?.title?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + Stats + Subscribe */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yt-text leading-tight">
              {snippet?.title}
            </h1>
            {handle && (
              <p className="text-sm text-yt-text2 mt-0.5">{handle}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-yt-text2">
              <span>{formatSubscribers(statistics?.subscriberCount)} subscribers</span>
              <span className="text-yt-text3">·</span>
              <span>{parseInt(statistics?.videoCount || 0).toLocaleString()} videos</span>
            </div>
            {snippet?.description && (
              <p className="text-sm text-yt-text2 mt-2 line-clamp-2 max-w-xl">
                {snippet.description}
              </p>
            )}
          </div>

          {/* Subscribe Button */}
          <button
            onClick={() => setSubscribed((p) => !p)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
              ${subscribed
                ? 'bg-yt-bg3 text-yt-text hover:bg-yt-hover'
                : 'bg-yt-text text-yt-bg hover:opacity-90 active:scale-95'
              }`}
          >
            {subscribed ? 'Subscribed ✓' : 'Subscribe'}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-yt-border px-4 sm:px-8 flex overflow-x-auto hide-scrollbar">
        {['videos', 'about'].map((tab) => (
          <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </TabButton>
        ))}
      </div>

      {/* ── Videos Tab ── */}
      {activeTab === 'videos' && (
        <div className="px-4 sm:px-6 py-6">
          {/* Sort bar */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-yt-text2 font-medium">Latest</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
            {videosLoading
              ? Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)
              : videos.map((item) => {
                  const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId
                  return <ChannelVideoCard key={videoId} item={item} />
                })}
          </div>

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="flex justify-center py-8">
            {isFetchingNextPage && <Spinner />}
          </div>
        </div>
      )}

      {/* ── About Tab ── */}
      {activeTab === 'about' && (
        <div className="px-4 sm:px-8 py-8 max-w-2xl">
          <h2 className="text-lg font-semibold text-yt-text mb-4">About</h2>

          {snippet?.description ? (
            <p className="text-sm text-yt-text2 whitespace-pre-line leading-relaxed mb-8">
              {snippet.description}
            </p>
          ) : (
            <p className="text-sm text-yt-text2 mb-8">No description provided.</p>
          )}

          <div className="space-y-3 border-t border-yt-border pt-6">
            <div className="flex items-center gap-3 text-sm text-yt-text2">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              </svg>
              <span>{parseInt(statistics?.videoCount || 0).toLocaleString()} videos</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-yt-text2">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span>{formatSubscribers(statistics?.subscriberCount)} subscribers</span>
            </div>
            {statistics?.viewCount && (
              <div className="flex items-center gap-3 text-sm text-yt-text2">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                <span>{parseInt(statistics.viewCount).toLocaleString()} total views</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
