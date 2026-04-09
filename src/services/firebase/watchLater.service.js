import {
  doc, setDoc, deleteDoc, getDoc,
  collection, getDocs, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../config/firebase'
import { FIRESTORE } from '../../config/constants'

const watchLaterRef = (uid) =>
  collection(db, FIRESTORE.USERS, uid, FIRESTORE.WATCH_LATER)

export const saveToWatchLater = (uid, video) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve()
  return setDoc(doc(watchLaterRef(uid), video.id), {
    ...video,
    savedAt: serverTimestamp(),
  })
}

export const removeFromWatchLater = (uid, videoId) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve()
  return deleteDoc(doc(watchLaterRef(uid), videoId))
}

export const isInWatchLater = async (uid, videoId) => {
  if (!isFirebaseConfigured || !db) return false
  const snap = await getDoc(doc(watchLaterRef(uid), videoId))
  return snap.exists()
}

export const getWatchLater = async (uid) => {
  if (!isFirebaseConfigured || !db) return []
  const snap = await getDocs(
    query(watchLaterRef(uid), orderBy('savedAt', 'desc'))
  )
  return snap.docs.map((d) => d.data())
}
