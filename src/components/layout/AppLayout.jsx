import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from './Navbar/Navbar'
import Sidebar from './Sidebar/Sidebar'
import PersistentPlayer from '../player/PersistentPlayer'

// ─── Bottom Tab Bar (mobile only) ────────────────────────────────────────────
function BottomTabBar() {
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)

  const tabs = [
    {
      to: '/',
      label: 'Home',
      icon: (active) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'}>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      to: '/shorts',
      label: 'Shorts',
      icon: (active) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.77 10.32l-1.2-.5L18 9c1.66-.03 3-1.4 3-3.07-.01-.9-.4-1.72-.98-2.3A3.07 3.07 0 0017.93 3a3.07 3.07 0 00-2.17.9L14 5.66l-.63-.27C12.3 5.1 11.18 5 10 5 5.58 5 2 8.13 2 12s3.58 7 8 7c2.97 0 5.58-1.61 7.04-4.01L18.71 12l-.94-1.68zM10 17c-3.31 0-6-2.24-6-5s2.69-5 6-5c.76 0 1.5.14 2.17.38l-3.46 2.35A2 2 0 009 12c0 1.1.9 2 2 2h.03l3.4-2.31C13.84 13.65 12.07 15 10 17zm5.73-4.5l-1.42.97-.31-1.97 1.73-1.97v2.97z" />
        </svg>
      ),
    },
    {
      to: '/trending',
      label: 'Trending',
      icon: (active) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'}>
          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
        </svg>
      ),
    },
    {
      to: '/history',
      label: 'You',
      icon: (active) =>
        user ? (
          <div className={`w-7 h-7 rounded-full overflow-hidden ring-2 ${active ? 'ring-yt-text' : 'ring-transparent'} transition-all`}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              : <div className="w-full h-full bg-yt-red flex items-center justify-center text-white text-xs font-medium">{user.displayName?.[0]?.toUpperCase()}</div>
            }
          </div>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? '0' : '1.8'}>
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        ),
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-yt-bg border-t border-yt-border z-50 flex items-center">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${isActive ? 'text-yt-text' : 'text-yt-text3'}`
          }
        >
          {({ isActive }) => (
            <>
              {tab.icon(isActive)}
              <span className={`text-[10px] font-medium ${isActive ? 'text-yt-text' : 'text-yt-text3'}`}>
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

// ─── App Layout ───────────────────────────────────────────────────────────────
export default function AppLayout() {
  const { sidebarOpen } = useSelector((s) => s.ui)

  return (
    <div className="min-h-screen bg-yt-bg text-yt-text font-roboto">
      <Navbar />
      <Sidebar />
      <PersistentPlayer />

      {/* Main content — offset for navbar top + bottom tab bar on mobile */}
      <main
        className={`pt-14 pb-14 md:pb-0 transition-all duration-200 ml-0 ${sidebarOpen ? 'md:ml-60' : 'md:ml-20'}`}
      >
        <Outlet />
      </main>

      {/* Bottom navigation bar (mobile only) */}
      <BottomTabBar />
    </div>
  )
}
