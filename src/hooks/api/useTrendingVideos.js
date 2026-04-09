import { useInfiniteQuery } from '@tanstack/react-query'
import { getTrendingVideos } from '../../services/youtube'
import { queryKeys } from '../../utils/queryKeys'

export const useTrendingVideos = (categoryId = '0') =>
  useInfiniteQuery({
    queryKey: queryKeys.trending(categoryId),
    queryFn: ({ pageParam = '' }) => getTrendingVideos({ categoryId, pageToken: pageParam }),
    getNextPageParam: (lastPage) => lastPage.data.nextPageToken ?? undefined,
    staleTime: 30 * 60 * 1000, // 30 min — protect quota
  })
