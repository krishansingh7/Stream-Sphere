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
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { FIRESTORE } from "../../config/constants";

// ✅ Uses onSnapshot — real-time listener with Firebase offline cache
// This NEVER loses data on refresh because Firebase SDK caches locally
export const useWatchHistory = () => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for Firebase auth to finish restoring session
    if (authLoading) return;
    if (!user?.uid || !isFirebaseConfigured || !db) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    const ref = collection(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.WATCH_HISTORY,
    );
    const q = query(ref, orderBy("watchedAt", "desc"));

    setIsLoading(true);
    // onSnapshot fires immediately from local cache, then syncs with server
    const unsub = onSnapshot(
      q,
      (snap) => {
        setHistory(snap.docs.map((d) => d.data()));
        setIsLoading(false);
      },
      (err) => {
        console.error("[Firestore] History error:", err.message);
        setIsLoading(false);
      },
    );

    return unsub; // cleanup listener on unmount / user change
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
        console.error("[History] add error:", e.message);
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
        console.error("[History] remove error:", e.message);
      }
    },
    [user?.uid],
  );

  const clearHistory = useCallback(async () => {
    if (!user?.uid || !isFirebaseConfigured || !db) return;
    try {
      const ref = collection(
        db,
        FIRESTORE.USERS,
        user.uid,
        FIRESTORE.WATCH_HISTORY,
      );
      const snap = await getDocs(ref);
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      console.error("[History] clear error:", e.message);
    }
  }, [user?.uid]);

  return { history, isLoading, addToHistory, removeFromHistory, clearHistory };
};
