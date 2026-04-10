import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import {
  addToPlaylist,
  removeFromPlaylist,
  clearPlaylist,
  subscribeToPlaylist,
} from "../../services/firebase";

export const usePlaylist = () => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [playlist, setPlaylist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      setPlaylist([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    unsubRef.current = subscribeToPlaylist(user.uid, (data) => {
      setPlaylist(data);
      setIsLoading(false);
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [user?.uid, authLoading]);

  const add = useCallback(
    async (video) => {
      if (!user?.uid) return;
      await addToPlaylist(user.uid, video);
    },
    [user?.uid],
  );

  const remove = useCallback(
    async (videoId) => {
      if (!user?.uid) return;
      await removeFromPlaylist(user.uid, videoId);
    },
    [user?.uid],
  );

  const clear = useCallback(async () => {
    if (!user?.uid) return;
    await clearPlaylist(user.uid);
  }, [user?.uid]);

  const isInPlaylist = useCallback(
    (videoId) => {
      return playlist.some((v) => v.id === videoId);
    },
    [playlist],
  );

  return { playlist, isLoading, add, remove, clear, isInPlaylist };
};
