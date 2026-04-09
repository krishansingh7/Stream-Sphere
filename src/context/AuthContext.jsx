import React, { createContext, useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { onAuthChange, getRedirectSignInResult } from '../services/firebase/auth.service'
import { setUser, clearUser } from '../store/slices/authSlice'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((s) => s.auth)

  useEffect(() => {
    // Capture redirect result (Brave browser fallback)
    getRedirectSignInResult().catch(() => {})

    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          accessToken: firebaseUser.stsTokenManager?.accessToken || null,
        }))
      } else {
        dispatch(clearUser())
      }
    })
    return unsubscribe
  }, [dispatch])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
