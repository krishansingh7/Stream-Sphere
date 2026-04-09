import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { FIRESTORE } from "../../config/constants";

export const useWatchLater = () => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [watchLater, setWatchLater] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid || !isFirebaseConfigured || !db) {
      setWatchLater([]);
      setIsLoading(false);
      return;
    }

    const ref = collection(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.WATCH_LATER,
    );
    const q = query(ref, orderBy("savedAt", "desc"));

    setIsLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setWatchLater(snap.docs.map((d) => d.data()));
        setIsLoading(false);
      },
      (err) => {
        console.error("[Firestore] WatchLater error:", err.message);
        setIsLoading(false);
      },
    );

    return unsub;
  }, [user?.uid, authLoading]);

  const saveToWatchLater = useCallback(
    async (video) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await setDoc(
          doc(db, FIRESTORE.USERS, user.uid, FIRESTORE.WATCH_LATER, video.id),
          { ...video, savedAt: serverTimestamp() },
        );
      } catch (e) {
        console.error("[WatchLater] add error:", e.message);
      }
    },
    [user?.uid],
  );

  const removeFromWatchLater = useCallback(
    async (videoId) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await deleteDoc(
          doc(db, FIRESTORE.USERS, user.uid, FIRESTORE.WATCH_LATER, videoId),
        );
      } catch (e) {
        console.error("[WatchLater] remove error:", e.message);
      }
    },
    [user?.uid],
  );

  return { watchLater, isLoading, saveToWatchLater, removeFromWatchLater };
};

export const useIsInWatchLater = (videoId) => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.uid || !videoId || !isFirebaseConfigured || !db) {
      setSaved(false);
      return;
    }
    const ref = doc(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.WATCH_LATER,
      videoId,
    );
    const unsub = onSnapshot(ref, (snap) => setSaved(snap.exists()));
    return unsub;
  }, [user?.uid, videoId, authLoading]);

  return saved;
};
