import { useQuery } from '@tanstack/react-query'
import { getRelatedVideos } from '../../services/youtube'
import { getVideoDetails } from '../../services/youtube'
import { queryKeys } from '../../utils/queryKeys'

export const useRelatedVideos = (videoId, channelId, categoryId, title) =>
  useQuery({
    queryKey: [...queryKeys.relatedVideos(videoId), channelId],
    queryFn: async () => {
      const res = await getRelatedVideos({ videoId, channelId, categoryId, title })
      const items = res.data.items || []

      // Enrich snippet-only results with full stats (views etc.)
      const ids = items
        .map((v) => v.id?.videoId || v.id)
        .filter(Boolean)
        .join(',')

      if (!ids) return []

      try {
        const details = await getVideoDetails(ids)
        return details.data.items || []
      } catch {
        return items
      }
    },
    enabled: !!videoId,
    staleTime: 10 * 60 * 1000,
  })
