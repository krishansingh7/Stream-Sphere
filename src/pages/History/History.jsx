import { useUserData } from "../../context/UserDataContext";
import { useSelector } from "react-redux";
import VideoRow from "../../components/video/VideoRow";
import EmptyState from "../../components/common/EmptyState";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

export default function History() {
  const { history, removeFromHistory, clearHistory } = useUserData();
  const { loading: authLoading } = useSelector((s) => s.auth);

  if (authLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="py-2 sm:py-6 max-w-4xl mx-auto md:mx-0 md:px-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-4 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-yt-text">Watch history</h1>
        {history.length > 0 && (
          <button
            onClick={() => {
              clearHistory();
              toast.success("History cleared");
            }}
            className="text-sm text-yt-blue hover:underline"
          >
            Clear all history
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          emoji="🕐"
          title="No watch history"
          subtitle="Videos you watch will appear here"
        />
      ) : (
        <div className="flex flex-col gap-1">
          {history.map((video) => (
            <VideoRow
              key={video.id}
              video={video}
              onRemove={(id) => {
                removeFromHistory(id);
                toast.success("Removed from history");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
