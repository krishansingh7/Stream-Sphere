import { useInfiniteQuery } from '@tanstack/react-query'
import { getChannelVideos, getVideoStatsBatch } from '../../services/youtube'

// Infinite scroll hook for channel videos with real stats (views + duration)
export const useChannelVideosInfinite = (channelId) =>
  useInfiniteQuery({
    queryKey: ['channelVideosInfinite', channelId],
    queryFn: async ({ pageParam = '' }) => {
      const res = await getChannelVideos({ channelId, pageToken: pageParam })
      const items = res.data.items || []

      // Batch-fetch real stats for this page of videos
      const videoIds = items
        .map((i) => i.contentDetails?.videoId || i.snippet?.resourceId?.videoId)
        .filter(Boolean)

      let statsMap = {}
      if (videoIds.length > 0) {
        try {
          const statsRes = await getVideoStatsBatch(videoIds)
          for (const v of statsRes.data.items || []) {
            statsMap[v.id] = {
              statistics: v.statistics,
              contentDetails: v.contentDetails,
            }
          }
        } catch {
          // silently continue without stats
        }
      }

      // Merge stats into playlist items
      const enriched = items.map((item) => {
        const vid = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId
        return { ...item, ...(statsMap[vid] || {}) }
      })

      return {
        items: enriched,
        nextPageToken: res.data.nextPageToken || null,
      }
    },
    getNextPageParam: (last) => last.nextPageToken ?? undefined,
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000,
  })
