import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("monone-auth");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!auth?.token) return;

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    let isActive = true;

    async function refreshProfile() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json() : null;

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            if (isActive) setAuth(null);
          }
          return;
        }

        if (isActive && data?.user) {
          setAuth((prev) => (prev ? { ...prev, user: data.user } : prev));
        }
      } catch (error) {
        // Ignore refresh failures to avoid breaking the session on transient errors.
      }
    }

    refreshProfile();
    return () => {
      isActive = false;
    };
  }, [auth?.token]);

  useEffect(() => {
    if (auth) {
      localStorage.setItem("monone-auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("monone-auth");
    }
  }, [auth]);

  const value = useMemo(
    () => ({
      auth,
      setAuth,
      logout: () => setAuth(null),
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
