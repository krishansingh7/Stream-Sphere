import { useQuery } from '@tanstack/react-query'
import { getChannelDetails, getChannelVideos } from '../../services/youtube'
import { queryKeys } from '../../utils/queryKeys'

export const useChannelDetails = (channelId) =>
  useQuery({
    queryKey: queryKeys.channel(channelId),
    queryFn: async () => {
      const res = await getChannelDetails(channelId)
      return res.data.items?.[0] || null
    },
    enabled: !!channelId,
    staleTime: 10 * 60 * 1000,
  })

export const useChannelVideos = (channelId) =>
  useQuery({
    queryKey: queryKeys.channelVideos(channelId),
    queryFn: async () => {
      const res = await getChannelVideos({ channelId })
      return res.data.items || []
    },
    enabled: !!channelId,
    staleTime: 10 * 60 * 1000,
  })
