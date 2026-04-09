import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      // Proxy for YouTube search suggestions — fixes CORS on localhost
      "/api/suggestions": {
        target: "https://suggestqueries.google.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/suggestions/, "/complete/search"),
        secure: true,
      },
    },
  },
});
