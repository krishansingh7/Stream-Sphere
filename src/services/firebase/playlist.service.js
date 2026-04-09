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

const playlistRef = (uid) =>
  collection(db, FIRESTORE.USERS, uid, FIRESTORE.PLAYLIST);

export const addToPlaylist = (uid, video) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve();
  return setDoc(doc(playlistRef(uid), video.id), {
    ...video,
    addedAt: serverTimestamp(),
  });
};

export const removeFromPlaylist = (uid, videoId) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve();
  return deleteDoc(doc(playlistRef(uid), videoId));
};

export const clearPlaylist = async (uid) => {
  if (!isFirebaseConfigured || !db) return;
  const snap = await getDocs(playlistRef(uid));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  return batch.commit();
};

export const subscribeToPlaylist = (uid, callback) => {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }
  const q = query(playlistRef(uid), orderBy("addedAt", "asc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => d.data())));
};
