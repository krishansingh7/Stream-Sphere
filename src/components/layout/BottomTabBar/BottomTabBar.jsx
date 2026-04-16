import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { signInWithGoogle, signOutUser } from "../../../services/firebase";
import toast from "react-hot-toast";

export default function BottomTabBar() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in!");
      setShowAccountSheet(false);
    } catch (e) {
      toast.error(e.message || "Sign in failed");
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    toast.success("Signed out");
    setShowAccountSheet(false);
  };

  const navTabs = [
    {
      to: "/",
      label: "Home",
      icon: (active) => (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? "0" : "1.8"}
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      to: "/shorts",
      label: "Shorts",
      icon: () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.77 10.32l-1.2-.5L18 9c1.66-.03 3-1.4 3-3.07-.01-.9-.4-1.72-.98-2.3A3.07 3.07 0 0017.93 3a3.07 3.07 0 00-2.17.9L14 5.66l-.63-.27C12.3 5.1 11.18 5 10 5 5.58 5 2 8.13 2 12s3.58 7 8 7c2.97 0 5.58-1.61 7.04-4.01L18.71 12l-.94-1.68zM10 17c-3.31 0-6-2.24-6-5s2.69-5 6-5c.76 0 1.5.14 2.17.38l-3.46 2.35A2 2 0 009 12c0 1.1.9 2 2 2h.03l3.4-2.31C13.84 13.65 12.07 15 10 17zm5.73-4.5l-1.42.97-.31-1.97 1.73-1.97v2.97z" />
        </svg>
      ),
    },
    {
      to: "/trending",
      label: "Trending",
      icon: (active) => (
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? "0" : "1.8"}
        >
          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ── Bottom navigation bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-yt-bg border-t border-yt-border z-50 flex items-center">
        {/* Regular nav tabs */}
        {navTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                isActive ? "text-yt-text" : "text-yt-text3"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {tab.icon(isActive)}
                <span
                  className={`text-[10px] font-medium ${isActive ? "text-yt-text" : "text-yt-text3"}`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* "You" tab — opens account sheet */}
        <button
          onClick={() => setShowAccountSheet(true)}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1 text-yt-text3 transition-colors"
        >
          {user ? (
            <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-transparent">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-yt-red flex items-center justify-center text-white text-xs font-medium">
                  {user.displayName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
          <span className="text-[10px] font-medium">You</span>
        </button>
      </nav>

      {/* ── Account bottom sheet ── */}
      {showAccountSheet && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-[150]"
            onClick={() => setShowAccountSheet(false)}
          />

          {/* Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[160] bg-yt-bg rounded-t-2xl shadow-2xl border-t border-yt-border overflow-hidden">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-yt-bg3" />
            </div>

            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-yt-border">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-yt-red flex items-center justify-center text-white text-lg font-medium">
                        {user.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-yt-text truncate">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-yt-text2 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Quick nav links */}
                {[
                  {
                    label: "Watch History",
                    to: "/history",
                    icon: "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.95-2.05l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z",
                  },
                  {
                    label: "Liked Videos",
                    to: "/liked",
                    icon: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
                  },
                  {
                    label: "Watch Later",
                    to: "/watch-later",
                    icon: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
                  },
                  {
                    label: "My Playlist",
                    to: "/playlist",
                    icon: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z",
                  },
                ].map((item) => (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to);
                      setShowAccountSheet(false);
                    }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-sm text-yt-text hover:bg-yt-bg2 active:bg-yt-bg3 transition-colors text-left"
                  >
                    <svg
                      className="w-5 h-5 text-yt-text2 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                ))}

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 px-5 py-4 text-sm text-yt-red hover:bg-yt-bg2 active:bg-yt-bg3 transition-colors border-t border-yt-border"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                  </svg>
                  Sign out
                </button>
              </>
            ) : (
              /* Sign-in prompt */
              <div className="px-5 py-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-yt-bg3 flex items-center justify-center mb-3">
                    <svg
                      className="w-8 h-8 text-yt-text2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-yt-text mb-1">
                    Sign in to StreamSphere
                  </h3>
                  <p className="text-sm text-yt-text2">
                    Like videos, save to playlists, and view your history
                  </p>
                </div>
                <button
                  onClick={handleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-yt-blue text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            )}

            <div className="h-4" />
          </div>
        </>
      )}
    </>
  );
}
