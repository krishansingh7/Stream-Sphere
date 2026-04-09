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
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../config/firebase";
import { FIRESTORE } from "../../config/constants";

export const useLikedVideos = () => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [likedVideos, setLikedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid || !isFirebaseConfigured || !db) {
      setLikedVideos([]);
      setIsLoading(false);
      return;
    }

    const ref = collection(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.LIKED_VIDEOS,
    );
    const q = query(ref, orderBy("likedAt", "desc"));

    setIsLoading(true);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLikedVideos(snap.docs.map((d) => d.data()));
        setIsLoading(false);
      },
      (err) => {
        console.error("[Firestore] Likes error:", err.message);
        setIsLoading(false);
      },
    );

    return unsub;
  }, [user?.uid, authLoading]);

  const likeVideo = useCallback(
    async (video) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await setDoc(
          doc(db, FIRESTORE.USERS, user.uid, FIRESTORE.LIKED_VIDEOS, video.id),
          { ...video, likedAt: serverTimestamp() },
        );
      } catch (e) {
        console.error("[Likes] add error:", e.message);
      }
    },
    [user?.uid],
  );

  const unlikeVideo = useCallback(
    async (videoId) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await deleteDoc(
          doc(db, FIRESTORE.USERS, user.uid, FIRESTORE.LIKED_VIDEOS, videoId),
        );
      } catch (e) {
        console.error("[Likes] remove error:", e.message);
      }
    },
    [user?.uid],
  );

  return { likedVideos, isLoading, likeVideo, unlikeVideo };
};

// Check if a specific video is liked — reads from snapshot for speed
export const useIsLiked = (videoId) => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.uid || !videoId || !isFirebaseConfigured || !db) {
      setLiked(false);
      return;
    }
    const ref = doc(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.LIKED_VIDEOS,
      videoId,
    );
    const unsub = onSnapshot(ref, (snap) => setLiked(snap.exists()));
    return unsub;
  }, [user?.uid, videoId, authLoading]);

  return liked;
};
