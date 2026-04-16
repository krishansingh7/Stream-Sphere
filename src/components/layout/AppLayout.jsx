import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./Navbar/Navbar";
import Sidebar from "./Sidebar/Sidebar";
import BottomTabBar from "./BottomTabBar/BottomTabBar";
import PersistentPlayer from "../player/PersistentPlayer";

export default function AppLayout() {
  const { sidebarOpen } = useSelector((s) => s.ui);

  return (
    <div className="min-h-screen bg-yt-bg text-yt-text font-roboto">
      <Navbar />
      <Sidebar />
      <PersistentPlayer />

      {/* Main content — top offset for navbar, bottom offset for mobile tab bar */}
      <main
        className={`pt-14 pb-14 md:pb-0 transition-all duration-200 ml-0 ${
          sidebarOpen ? "md:ml-60" : "md:ml-20"
        }`}
      >
        <Outlet />
      </main>

      <BottomTabBar />
    </div>
  );
}
