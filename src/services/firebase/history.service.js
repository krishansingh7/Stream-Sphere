import {
  doc, setDoc, deleteDoc, collection,
  getDocs, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../config/firebase'
import { FIRESTORE } from '../../config/constants'

const historyRef = (uid) =>
  collection(db, FIRESTORE.USERS, uid, FIRESTORE.WATCH_HISTORY)

export const addToHistory = (uid, video) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve()
  return setDoc(doc(historyRef(uid), video.id), {
    ...video,
    watchedAt: serverTimestamp(),
  })
}

export const removeFromHistory = (uid, videoId) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve()
  return deleteDoc(doc(historyRef(uid), videoId))
}

export const getHistory = async (uid) => {
  if (!isFirebaseConfigured || !db) return []
  const snap = await getDocs(
    query(historyRef(uid), orderBy('watchedAt', 'desc'))
  )
  return snap.docs.map((d) => d.data())
}

export const clearHistory = async (uid) => {
  if (!isFirebaseConfigured || !db) return
  const snap = await getDocs(historyRef(uid))
  const deletes = snap.docs.map((d) => deleteDoc(d.ref))
  return Promise.all(deletes)
}
