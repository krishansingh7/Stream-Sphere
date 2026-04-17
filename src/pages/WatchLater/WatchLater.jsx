import { useUserData } from "../../context/UserDataContext";
import { useSelector } from "react-redux";
import VideoRow from "../../components/video/VideoRow";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

export default function WatchLater() {
  const { watchLater, removeFromWatchLater } = useUserData();
  const { loading: authLoading } = useSelector((s) => s.auth);

  if (authLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="py-2 sm:py-6 max-w-4xl mx-auto md:px-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-yt-text mb-4 sm:mb-6 px-4 sm:px-0">Watch later</h1>

      {watchLater.length === 0 ? (
        <EmptyState
          emoji="🕒"
          title="No saved videos"
          subtitle="Save videos to watch them later"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {watchLater.map((video) => (
            <VideoRow
              key={video.id}
              video={video}
              onRemove={(id) => {
                removeFromWatchLater(id);
                toast.success("Removed from Watch Later");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
