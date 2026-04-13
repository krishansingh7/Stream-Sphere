import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from './Navbar/Navbar'
import Sidebar from './Sidebar/Sidebar'
import PersistentPlayer from '../player/PersistentPlayer'

export default function AppLayout() {
  const { sidebarOpen } = useSelector((s) => s.ui)

  return (
    <div className="min-h-screen bg-yt-bg text-yt-text font-roboto">
      <Navbar />
      <Sidebar />
      <PersistentPlayer />
      {/* Shift content right based on sidebar state */}
      <main
        className="pt-14 transition-all duration-200"
        style={{ marginLeft: sidebarOpen ? '240px' : '80px' }}
      >
        <Outlet />
      </main>
    </div>
  )
}
