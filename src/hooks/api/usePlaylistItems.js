import { useInfiniteQuery } from '@tanstack/react-query'
import { getPlaylistItems } from '../../services/youtube/channels.service'

export const usePlaylistItems = (playlistId) =>
  useInfiniteQuery({
    queryKey: ['playlistItems', playlistId],
    queryFn: async ({ pageParam = '' }) => {
      if (!playlistId) return { items: [], nextPageToken: null }
      const res = await getPlaylistItems({ playlistId, pageToken: pageParam })
      return {
        items: res.data.items || [],
        nextPageToken: res.data.nextPageToken || null,
        totalResults: res.data.pageInfo?.totalResults || 0,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: !!playlistId,
    staleTime: 30 * 60 * 1000,
  })
