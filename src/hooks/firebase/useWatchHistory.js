import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { FIRESTORE } from "../../config/constants";

export const useWatchHistory = () => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const unsubRef = useRef(null);

  useEffect(() => {
    // Auth is still restoring on page refresh — wait
    if (authLoading) return;

    // User logged out — clear data immediately
    if (!user?.uid) {
      // Unsubscribe any active listener
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      setHistory([]);
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured || !db) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ref = collection(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.WATCH_HISTORY,
    );
    const q = query(ref, orderBy("watchedAt", "desc"));

    // Real-time listener — reads from local cache first, then syncs
    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        setHistory(snap.docs.map((d) => d.data()));
        setIsLoading(false);
      },
      (err) => {
        console.error("[History]", err.message);
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

  const addToHistory = useCallback(
    async (video) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await setDoc(
          doc(db, FIRESTORE.USERS, user.uid, FIRESTORE.WATCH_HISTORY, video.id),
          { ...video, watchedAt: serverTimestamp() },
        );
      } catch (e) {
        console.error("[History add]", e.message);
      }
    },
    [user?.uid],
  );

  const removeFromHistory = useCallback(
    async (videoId) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await deleteDoc(
          doc(db, FIRESTORE.USERS, user.uid, FIRESTORE.WATCH_HISTORY, videoId),
        );
      } catch (e) {
        console.error("[History remove]", e.message);
      }
    },
    [user?.uid],
  );

  const clearHistory = useCallback(async () => {
    if (!user?.uid || !isFirebaseConfigured || !db) return;
    try {
      const snap = await getDocs(
        collection(db, FIRESTORE.USERS, user.uid, FIRESTORE.WATCH_HISTORY),
      );
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      console.error("[History clear]", e.message);
    }
  }, [user?.uid]);

  return { history, isLoading, addToHistory, removeFromHistory, clearHistory };
};
