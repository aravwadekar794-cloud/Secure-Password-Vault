// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuth, clearAuth, api } from "../services/api";
import {
  loginRequest,
  registerRequest,
  fetchRole,
  logoutRequest,
} from "../services/userService";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const loggedInUser = localStorage.getItem("loggedInUser");

    // 1. If we have a valid non-expired token in localStorage, restore session immediately
    if (storedToken) {
      const payload = decodeJwt(storedToken);
      const isExpired = payload?.exp ? payload.exp * 1000 < Date.now() : false;
      if (!isExpired) {
        setAuth(storedToken);
        const role = payload?.role || "ROLE_USER";
        const uname = payload?.sub || storedUsername;
        setUser({ username: uname, role, isAdmin: role === "ROLE_ADMIN" });
        setLoading(false);
        return;
      }
    }

    // 2. If loggedInUser is not set, finish loading
    if (loggedInUser !== "true" || !storedUsername) {
      setLoading(false);
      return;
    }

    // 3. Otherwise try to refresh token via cookie
    (async () => {
      try {
        const res = await api.post("/api/user/refresh");
        const { token } = res.data;

        if (token) {
          setAuth(token);
          const payload = decodeJwt(token);
          let role = payload?.role;
          if (!role) {
            role = await fetchRole().catch(() => "ROLE_USER");
          }
          setUser({ username: storedUsername, role, isAdmin: role === "ROLE_ADMIN" });
        }
      } catch (err) {
        console.warn("Session restoration failed:", err);
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Run ONLY once on mount to avoid clearing session on route changes

  const login = async (username, password) => {
    try {
      const res = await loginRequest(username, password);
      const token = res.token;

      setAuth(token);
      console.log("🔐 AccessToken after login:", token);

      localStorage.setItem("loggedInUser", "true");
      localStorage.setItem("username", username);

      const payload = decodeJwt(token);
      let role = payload?.role;
      if (!role) {
        role = await fetchRole().catch(() => "ROLE_USER");
      }
      setUser({ username, role, isAdmin: role === "ROLE_ADMIN" });

      return { success: true, message: "Logged in successfully" };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.status === 401 ? "Invalid credentials" : "Login failed",
      };
    }
  };

  const register = async (username, password) => {
    try {
      const msg = await registerRequest(username, password);
      return { success: true, message: msg };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (e) {
      console.warn("⚠️ Backend logout failed or already logged out");
    }

    clearAuth();
    setUser(null);
    localStorage.removeItem("lastPath");
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
