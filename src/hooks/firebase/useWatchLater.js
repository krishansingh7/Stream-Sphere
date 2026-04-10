import { useState, useEffect, useCallback, useRef } from "react";
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
  const unsubRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      setWatchLater([]);
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured || !db) {
      setWatchLater([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ref = collection(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.WATCH_LATER,
    );
    const q = query(ref, orderBy("savedAt", "desc"));

    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        setWatchLater(snap.docs.map((d) => d.data()));
        setIsLoading(false);
      },
      (err) => {
        console.error("[WatchLater]", err.message);
        setIsLoading(false);
      },
    );

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
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
        console.error("[WatchLater add]", e.message);
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
        console.error("[WatchLater remove]", e.message);
      }
    },
    [user?.uid],
  );

  return { watchLater, isLoading, saveToWatchLater, removeFromWatchLater };
};

export const useIsInWatchLater = (videoId) => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [saved, setSaved] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

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
    unsubRef.current = onSnapshot(ref, (snap) => setSaved(snap.exists()));

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [user?.uid, videoId, authLoading]);

  return saved;
};
