import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../../store/slices/uiSlice";
import { NavLink, useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../../../services/firebase";
import { useUserData } from "../../../context/UserDataContext";
import toast from "react-hot-toast";

const HomeIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
  </svg>
);
const ShortsIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.56-3.22 1.6-5.06s-3.22-2.56-5.06-1.6L6 6.94c-1.29.68-2.07 2.01-2 3.44.07 1.43.95 2.67 2.29 3.23l1.2.5L6 14.94c-1.84.96-2.56 3.22-1.6 5.06.96 1.84 3.22 2.56 5.06 1.6l8.54-4.54c1.29-.68 2.07-2.01 2-3.44-.07-1.43-.95-2.67-2.23-3.3zM10 14.45v-5l5 2.5-5 2.5z" />
  </svg>
);
const SubIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
  </svg>
);
const HistoryIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);
const WatchLaterIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z" />
  </svg>
);
const LikeIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
  </svg>
);
const TrendingIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17.2 3L15 5.2l2.6 2.6-9.6 9.6-4-4L1 16.4l4 4 11.6-11.6L19.2 11 21.4 8.8 17.2 3z" />
  </svg>
);
const SignInIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
  </svg>
);
const PlaylistIcon = () => (
  <svg
    className="w-6 h-6 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
  </svg>
);

function FullItem({ to, icon, label, onClick, badge }) {
  const base =
    "flex items-center gap-6 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm font-medium text-yt-text w-full relative";
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${base} ${isActive ? "bg-yt-bg3 font-semibold" : "hover:bg-yt-bg3"}`
        }
      >
        {icon}
        <span>{label}</span>
        {badge > 0 && (
          <span className="ml-auto bg-yt-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </NavLink>
    );
  }
  return (
    <button onClick={onClick} className={`${base} hover:bg-yt-bg3`}>
      {icon}
      <span>{label}</span>
      {badge > 0 && (
        <span className="ml-auto bg-yt-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

function MiniItem({ to, icon, label, onClick, badge }) {
  const base =
    "flex flex-col items-center justify-center gap-1 py-3 w-full rounded-xl transition-colors cursor-pointer text-yt-text relative";
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${base} ${isActive ? "bg-yt-bg3" : "hover:bg-yt-bg3"}`
        }
      >
        <div className="relative">
          {icon}
          {badge > 0 && (
            <span className="absolute -top-1 -right-1 bg-yt-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium">{label}</span>
      </NavLink>
    );
  }
  return (
    <button onClick={onClick} className={`${base} hover:bg-yt-bg3`}>
      <div className="relative">
        {icon}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-yt-red text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { playlist } = useUserData();
  const playlistCount = playlist.length;

  const handleProtected = (path) => {
    if (!user) {
      toast.error("Please sign in to continue");
      return;
    }
    navigate(path);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Signed in!");
    } catch (e) {
      toast.error(e.message || "Sign in failed");
    }
  };

  // When closed, render mini-sidebar ONLY on desktop
  if (!sidebarOpen) {
    return (
      <aside className="hidden md:flex fixed top-14 left-0 w-20 h-[calc(100vh-56px)] bg-yt-bg z-40 flex-col items-center py-2 overflow-y-auto hide-scrollbar">
        <MiniItem to="/" icon={<HomeIcon />} label="Home" />
        <MiniItem to="/shorts" icon={<ShortsIcon />} label="Shorts" />
        {/* <MiniItem icon={<SubIcon />} label="Subscriptions" onClick={() => {}} /> */}
        <div className="w-10 border-t border-yt-border my-2" />
        <MiniItem
          icon={<HistoryIcon />}
          label="History"
          onClick={() => handleProtected("/history")}
        />
        <MiniItem
          icon={<WatchLaterIcon />}
          label="Later"
          onClick={() => handleProtected("/watch-later")}
        />
        <MiniItem
          icon={<LikeIcon />}
          label="Liked"
          onClick={() => handleProtected("/liked")}
        />
        <MiniItem
          icon={<PlaylistIcon />}
          label="Playlist"
          onClick={() => handleProtected("/playlist")}
          badge={playlistCount}
        />
        <div className="w-10 border-t border-yt-border my-2" />
        <MiniItem
          icon={<TrendingIcon />}
          label="Trending"
          onClick={() => navigate("/trending")}
        />
      </aside>
    );
  }

  // When open, render full sidebar (with mobile overlay)
  return (
    <>
      <div 
        className="md:hidden fixed inset-0 top-14 bg-black/50 z-40"
        onClick={() => dispatch(toggleSidebar())}
      />
      <aside className="fixed top-14 left-0 w-60 h-[calc(100vh-56px)] overflow-y-auto bg-yt-bg z-50 pb-6 hide-scrollbar shadow-2xl md:shadow-none">
        <div className="px-3 py-2">
          <div className="mb-1">
          <FullItem to="/" icon={<HomeIcon />} label="Home" />
          <FullItem to="/shorts" icon={<ShortsIcon />} label="Shorts" />
          {/* <FullItem
            icon={<SubIcon />}
            label="Subscriptions"
            onClick={() => {}}
          /> */}
        </div>

        <div className="border-t border-yt-border my-3" />

        <div className="mb-1">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-base font-medium text-yt-text">You</span>
            <svg
              className="w-4 h-4 text-yt-text2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </div>
          <FullItem
            icon={<HistoryIcon />}
            label="History"
            onClick={() => handleProtected("/history")}
          />
          <FullItem
            icon={<WatchLaterIcon />}
            label="Watch later"
            onClick={() => handleProtected("/watch-later")}
          />
          <FullItem
            icon={<LikeIcon />}
            label="Liked videos"
            onClick={() => handleProtected("/liked")}
          />
          <FullItem
            to="/playlist"
            icon={<PlaylistIcon />}
            label="My Playlist"
            badge={playlistCount}
            onClick={() => handleProtected("/playlist")}
          />
        </div>

        <div className="border-t border-yt-border my-3" />

        <div className="mb-1">
          <p className="px-3 py-1 text-base font-medium text-yt-text">
            Explore
          </p>
          <FullItem
            icon={<TrendingIcon />}
            label="Trending"
            onClick={() => navigate("/trending")}
          />
        </div>

        {!user && (
          <>
            <div className="border-t border-yt-border my-3" />
            <div className="px-3 py-3 flex flex-col gap-3">
              <p className="text-sm text-yt-text2">
                Sign in to like videos, save, watch history and playlist.
              </p>
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 px-4 py-1.5 border border-yt-blue text-yt-blue rounded-full text-sm font-medium hover:bg-blue-900/20 transition-colors self-start"
              >
                <SignInIcon /> Sign in
              </button>
            </div>
          </>
        )}
      </div>
      </aside>
    </>
  );
}
