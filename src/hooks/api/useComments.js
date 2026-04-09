import { useInfiniteQuery } from '@tanstack/react-query'
import { getComments } from '../../services/youtube'
import { queryKeys } from '../../utils/queryKeys'

export const useComments = (videoId) =>
  useInfiniteQuery({
    queryKey: queryKeys.comments(videoId),
    queryFn: ({ pageParam = '' }) => getComments({ videoId, pageToken: pageParam }),
    getNextPageParam: (lastPage) => lastPage.data.nextPageToken ?? undefined,
    enabled: !!videoId,
    staleTime: 2 * 60 * 1000,
  })
