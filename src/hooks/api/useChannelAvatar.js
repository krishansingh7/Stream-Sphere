import { useQuery } from "@tanstack/react-query";
import { getChannelDetails } from "../../services/youtube";

// Fetches and caches a single channel's thumbnail
// React Query deduplicates — if 20 cards share 5 channels, only 5 API calls happen
export const useChannelAvatar = (channelId) =>
  useQuery({
    queryKey: ["channelAvatar", channelId],
    queryFn: async () => {
      const res = await getChannelDetails(channelId);
      const ch = res.data.items?.[0];
      return ch?.snippet?.thumbnails?.default?.url || null;
    },
    enabled: !!channelId,
    staleTime: Infinity, // Avatar never changes in a session
    gcTime: 60 * 60 * 1000, // Keep in cache 1 hour
    retry: false,
  });
