
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);

export const signup = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

const MESSAGES = {
  "auth/invalid-email": "Invalid email address.",
  "auth/missing-password": "Please enter a password.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/user-not-found": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/popup-closed-by-user": "Google sign-in window was closed.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked": "The browser blocked the sign-in popup.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/unauthorized-domain":
    "This domain is not authorized in Firebase (Authentication → Settings → Authorized domains).",
};

export const getAuthErrorMessage = (error) =>
  MESSAGES[error?.code] || error?.message || "Something went wrong.";
