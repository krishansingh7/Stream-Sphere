/**
 * UserDataContext — Single source of truth for all user-specific Firestore data.
 *
 * WHY THIS APPROACH:
 * - Subscribed ONCE at app root, never remounted
 * - Survives page navigations (no per-page listener teardown)
 * - React StrictMode safe — cleanup is handled at app unmount only
 * - Data flows down via context — zero prop drilling
 * - Clears instantly on logout, restores instantly on login
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
import { db, isFirebaseConfigured } from "../config/firebase";
import { FIRESTORE } from "../config/constants";

const UserDataContext = createContext(null);

// Helper — builds the Firestore collection path for a user sub-collection
const col = (uid, name) => collection(db, FIRESTORE.USERS, uid, name);
const docRef = (uid, name, id) => doc(db, FIRESTORE.USERS, uid, name, id);

export const UserDataProvider = ({ children }) => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);

  const [history, setHistory] = useState([]);
  const [liked, setLiked] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [dataReady, setDataReady] = useState(false);

  // Keep all active Firestore unsubscribe functions
  const subs = useRef([]);

  // Unsubscribe all active listeners and reset state
  const clearAll = useCallback(() => {
    subs.current.forEach((fn) => fn());
    subs.current = [];
    setHistory([]);
    setLiked([]);
    setWatchLater([]);
    setPlaylist([]);
    setDataReady(false);
  }, []);

  useEffect(() => {
    // Wait until Firebase auth has finished restoring the session
    if (authLoading) return;

    // User signed out → clear everything
    if (!user?.uid || !isFirebaseConfigured || !db) {
      clearAll();
      return;
    }

    const uid = user.uid;

    // Subscribe to all 4 collections at once
    const sub1 = onSnapshot(
      query(col(uid, FIRESTORE.WATCH_HISTORY), orderBy("watchedAt", "desc")),
      (s) => setHistory(s.docs.map((d) => d.data())),
      (e) => console.error("[History listener]", e.message),
    );
    const sub2 = onSnapshot(
      query(col(uid, FIRESTORE.LIKED_VIDEOS), orderBy("likedAt", "desc")),
      (s) => setLiked(s.docs.map((d) => d.data())),
      (e) => console.error("[Liked listener]", e.message),
    );
    const sub3 = onSnapshot(
      query(col(uid, FIRESTORE.WATCH_LATER), orderBy("savedAt", "desc")),
      (s) => setWatchLater(s.docs.map((d) => d.data())),
      (e) => console.error("[WatchLater listener]", e.message),
    );
    const sub4 = onSnapshot(
      query(col(uid, FIRESTORE.PLAYLIST), orderBy("addedAt", "asc")),
      (s) => setPlaylist(s.docs.map((d) => d.data())),
      (e) => console.error("[Playlist listener]", e.message),
    );

    subs.current = [sub1, sub2, sub3, sub4];
    setDataReady(true);

    return clearAll;
  }, [user?.uid, authLoading, clearAll]);

  // ── Watch History ──────────────────────────────────────────────────
  const addToHistory = useCallback(
    async (video) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await setDoc(docRef(user.uid, FIRESTORE.WATCH_HISTORY, video.id), {
          ...video,
          watchedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("[addToHistory]", e.message);
      }
    },
    [user?.uid],
  );

  const removeFromHistory = useCallback(
    async (videoId) => {
      if (!user?.uid) return;
      try {
        await deleteDoc(docRef(user.uid, FIRESTORE.WATCH_HISTORY, videoId));
      } catch (e) {
        console.error("[removeFromHistory]", e.message);
      }
    },
    [user?.uid],
  );

  const clearHistory = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const snap = await getDocs(col(user.uid, FIRESTORE.WATCH_HISTORY));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      console.error("[clearHistory]", e.message);
    }
  }, [user?.uid]);

  // ── Liked Videos ──────────────────────────────────────────────────
  const likeVideo = useCallback(
    async (video) => {
      if (!user?.uid) return;
      try {
        await setDoc(docRef(user.uid, FIRESTORE.LIKED_VIDEOS, video.id), {
          ...video,
          likedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("[likeVideo]", e.message);
      }
    },
    [user?.uid],
  );

  const unlikeVideo = useCallback(
    async (videoId) => {
      if (!user?.uid) return;
      try {
        await deleteDoc(docRef(user.uid, FIRESTORE.LIKED_VIDEOS, videoId));
      } catch (e) {
        console.error("[unlikeVideo]", e.message);
      }
    },
    [user?.uid],
  );

  // ── Watch Later ───────────────────────────────────────────────────
  const saveToWatchLater = useCallback(
    async (video) => {
      if (!user?.uid) return;
      try {
        await setDoc(docRef(user.uid, FIRESTORE.WATCH_LATER, video.id), {
          ...video,
          savedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("[saveToWatchLater]", e.message);
      }
    },
    [user?.uid],
  );

  const removeFromWatchLater = useCallback(
    async (videoId) => {
      if (!user?.uid) return;
      try {
        await deleteDoc(docRef(user.uid, FIRESTORE.WATCH_LATER, videoId));
      } catch (e) {
        console.error("[removeFromWatchLater]", e.message);
      }
    },
    [user?.uid],
  );

  // ── Playlist ──────────────────────────────────────────────────────
  const addToPlaylist = useCallback(
    async (video) => {
      if (!user?.uid) return;
      try {
        await setDoc(docRef(user.uid, FIRESTORE.PLAYLIST, video.id), {
          ...video,
          addedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("[addToPlaylist]", e.message);
      }
    },
    [user?.uid],
  );

  const removeFromPlaylist = useCallback(
    async (videoId) => {
      if (!user?.uid) return;
      try {
        await deleteDoc(docRef(user.uid, FIRESTORE.PLAYLIST, videoId));
      } catch (e) {
        console.error("[removeFromPlaylist]", e.message);
      }
    },
    [user?.uid],
  );

  const clearPlaylist = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const snap = await getDocs(col(user.uid, FIRESTORE.PLAYLIST));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (e) {
      console.error("[clearPlaylist]", e.message);
    }
  }, [user?.uid]);

  // ── Derived helpers ───────────────────────────────────────────────
  const isLiked = useCallback((id) => liked.some((v) => v.id === id), [liked]);
  const isInWatchLater = useCallback(
    (id) => watchLater.some((v) => v.id === id),
    [watchLater],
  );
  const isInPlaylist = useCallback(
    (id) => playlist.some((v) => v.id === id),
    [playlist],
  );

  const value = {
    // State
    history,
    liked,
    watchLater,
    playlist,
    dataReady,
    isLoading: !dataReady && authLoading,

    // History
    addToHistory,
    removeFromHistory,
    clearHistory,

    // Liked
    likeVideo,
    unlikeVideo,
    isLiked,

    // Watch Later
    saveToWatchLater,
    removeFromWatchLater,
    isInWatchLater,

    // Playlist
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    isInPlaylist,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used inside UserDataProvider");
  return ctx;
};
