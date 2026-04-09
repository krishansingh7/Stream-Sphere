import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Spinner from "./components/common/Spinner";

const Home = lazy(() => import("./pages/Home/Home"));
const Watch = lazy(() => import("./pages/Watch/Watch"));
const Search = lazy(() => import("./pages/Search/Search"));
const Channel = lazy(() => import("./pages/Channel/Channel"));
const History = lazy(() => import("./pages/History/History"));
const LikedVideos = lazy(() => import("./pages/LikedVideos/LikedVideos"));
const WatchLater = lazy(() => import("./pages/WatchLater/WatchLater"));
const Playlist = lazy(() => import("./pages/Playlist/Playlist"));

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-yt-bg">
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/watch" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/channel/:channelId" element={<Channel />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/liked"
              element={
                <ProtectedRoute>
                  <LikedVideos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watch-later"
              element={
                <ProtectedRoute>
                  <WatchLater />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlist"
              element={
                <ProtectedRoute>
                  <Playlist />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
