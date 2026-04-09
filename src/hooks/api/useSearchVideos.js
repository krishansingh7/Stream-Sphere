import { useInfiniteQuery } from '@tanstack/react-query'
import { searchVideos, getVideoDetails } from '../../services/youtube'
import { queryKeys } from '../../utils/queryKeys'

export const useSearchVideos = (query, order = 'relevance') =>
  useInfiniteQuery({
    queryKey: queryKeys.search(query, order),
    queryFn: async ({ pageParam = '' }) => {
      // Step 1: search.list — 100 units — returns IDs only
      const searchRes = await searchVideos({ query, pageToken: pageParam, order })
      const items = searchRes.data.items || []
      const ids = items.map((i) => i.id.videoId).filter(Boolean)

      if (!ids.length) return { data: { items: [], nextPageToken: null } }

      // Step 2: videos.list — 1 unit — get full details
      const detailsRes = await getVideoDetails(ids)
      return {
        data: {
          items: detailsRes.data.items || [],
          nextPageToken: searchRes.data.nextPageToken,
        },
      }
    },
    getNextPageParam: (lastPage) => lastPage.data.nextPageToken ?? undefined,
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000,
  })
