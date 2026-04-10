import { useUserData } from "../../context/UserDataContext";
import { useSelector } from "react-redux";
import VideoRow from "../../components/video/VideoRow";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

export default function LikedVideos() {
  const { liked, unlikeVideo } = useUserData();
  const { loading: authLoading } = useSelector((s) => s.auth);

  if (authLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="px-6 py-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-yt-text mb-6">Liked videos</h1>

      {liked.length === 0 ? (
        <EmptyState
          emoji="👍"
          title="No liked videos yet"
          subtitle="Videos you like will appear here"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {liked.map((video) => (
            <VideoRow
              key={video.id}
              video={video}
              onRemove={(id) => {
                unlikeVideo(id);
                toast.success("Removed from liked videos");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
