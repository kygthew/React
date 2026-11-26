import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userLoggedOut } from "../store/actions";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true until Firebase tells us whether a saved session exists.
  // Without it, a refresh on /profile would redirect to /login for a split second.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Wraps an auth action: clears the old error, saves a readable one on failure.
  const run = async (action) => {
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(authService.getAuthErrorMessage(err));
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    clearError: () => setError(null),
    signup: (email, password) => run(() => authService.signup(email, password)),
    login: (email, password) => run(() => authService.login(email, password)),
    loginWithGoogle: () => run(() => authService.loginWithGoogle()),
    logout: () =>
      run(async () => {
        await authService.logout();
        // Private data must not stay in the store for the next user
        dispatch(userLoggedOut());
      }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
