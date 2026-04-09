import {
  doc, setDoc, deleteDoc, getDoc,
  collection, getDocs, orderBy, query, serverTimestamp,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../../config/firebase'
import { FIRESTORE } from '../../config/constants'

const likesRef = (uid) =>
  collection(db, FIRESTORE.USERS, uid, FIRESTORE.LIKED_VIDEOS)

export const likeVideo = (uid, video) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve()
  return setDoc(doc(likesRef(uid), video.id), {
    ...video,
    likedAt: serverTimestamp(),
  })
}

export const unlikeVideo = (uid, videoId) => {
  if (!isFirebaseConfigured || !db) return Promise.resolve()
  return deleteDoc(doc(likesRef(uid), videoId))
}

export const isVideoLiked = async (uid, videoId) => {
  if (!isFirebaseConfigured || !db) return false
  const snap = await getDoc(doc(likesRef(uid), videoId))
  return snap.exists()
}

export const getLikedVideos = async (uid) => {
  if (!isFirebaseConfigured || !db) return []
  const snap = await getDocs(
    query(likesRef(uid), orderBy('likedAt', 'desc'))
  )
  return snap.docs.map((d) => d.data())
}
