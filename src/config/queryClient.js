import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min for API data
      gcTime: 30 * 60 * 1000, // 30 min in cache
      retry: 2,
      refetchOnWindowFocus: false,
      // FIXED: was false — this prevented Firestore data from loading after refresh
      refetchOnMount: true,
    },
  },
});
