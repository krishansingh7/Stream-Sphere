import { useQuery } from '@tanstack/react-query'
import { getVideoDetails } from '../../services/youtube'
import { queryKeys } from '../../utils/queryKeys'

export const useVideoDetails = (videoId) =>
  useQuery({
    queryKey: queryKeys.videoDetails(videoId),
    queryFn: async () => {
      const res = await getVideoDetails(videoId)
      return res.data.items?.[0] || null
    },
    enabled: !!videoId,
    staleTime: 10 * 60 * 1000,
  })
