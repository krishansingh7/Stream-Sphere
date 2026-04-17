import { useInfiniteQuery } from '@tanstack/react-query'
import { getChannelPlaylists } from '../../services/youtube/channels.service'

export const useChannelPlaylists = (channelId) =>
  useInfiniteQuery({
    queryKey: ['channelPlaylists', channelId],
    queryFn: async ({ pageParam = '' }) => {
      if (!channelId) return { items: [], nextPageToken: null }
      const res = await getChannelPlaylists({ channelId, pageToken: pageParam })
      return {
        items: res.data.items || [],
        nextPageToken: res.data.nextPageToken || null,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: !!channelId,
    staleTime: 30 * 60 * 1000,
  })
