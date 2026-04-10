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

export const useLikedVideos = () => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [likedVideos, setLikedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      setLikedVideos([]);
      setIsLoading(false);
      return;
    }

    if (!isFirebaseConfigured || !db) {
      setLikedVideos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const ref = collection(
      db,
      FIRESTORE.USERS,
      user.uid,
      FIRESTORE.LIKED_VIDEOS,
    );
    const q = query(ref, orderBy("likedAt", "desc"));

    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        setLikedVideos(snap.docs.map((d) => d.data()));
        setIsLoading(false);
      },
      (err) => {
        console.error("[Likes]", err.message);
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

  const likeVideo = useCallback(
    async (video) => {
      if (!user?.uid || !isFirebaseConfigured || !db) return;
      try {
        await setDoc(
          doc(db, FIRESTORE.USERS, user.uid, FIRESTORE.LIKED_VIDEOS, video.id),
          { ...video, likedAt: serverTimestamp() },
        );
      } catch (e) {
        console.error("[Like add]", e.message);
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
        console.error("[Like remove]", e.message);
      }
    },
    [user?.uid],
  );

  return { likedVideos, isLoading, likeVideo, unlikeVideo };
};

// Per-video real-time like status
export const useIsLiked = (videoId) => {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const [liked, setLiked] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }

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
    unsubRef.current = onSnapshot(ref, (snap) => setLiked(snap.exists()));

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [user?.uid, videoId, authLoading]);

  return liked;
};
