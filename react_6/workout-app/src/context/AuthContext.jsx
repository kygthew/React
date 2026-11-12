import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
        queryClient.clear();
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
