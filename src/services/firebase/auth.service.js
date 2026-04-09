import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
} from "../../config/firebase";

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      "Firebase not configured. Fill in VITE_FIREBASE_* in your .env file.",
    );
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (err) {
    // Handle every possible popup/config error
    if (err.code === "auth/configuration-not-found") {
      throw new Error(
        "Google Sign-In is not enabled in your Firebase Console.\n\n" +
          "Steps to fix:\n" +
          "1. Go to https://console.firebase.google.com\n" +
          "2. Select your project → Authentication → Sign-in method\n" +
          "3. Click Google → Enable → Save\n" +
          "4. Also add localhost to Authorized domains",
      );
    }
    if (
      err.code === "auth/popup-blocked" ||
      err.code === "auth/popup-closed-by-user" ||
      err.code === "auth/cancelled-popup-request"
    ) {
      // Brave / popup blocked — fall back to redirect
      return signInWithRedirect(auth, googleProvider);
    }
    if (err.code === "auth/unauthorized-domain") {
      throw new Error(
        "This domain is not authorized in Firebase Console.\n" +
          "Go to Authentication → Settings → Authorized domains → Add localhost",
      );
    }
    throw err;
  }
};

export const getRedirectSignInResult = () => {
  if (!isFirebaseConfigured || !auth) return Promise.resolve(null);
  return getRedirectResult(auth).catch(() => null);
};

export const signOutUser = () => {
  if (!isFirebaseConfigured || !auth) return Promise.resolve();
  return signOut(auth);
};

export const onAuthChange = (callback) => {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};
