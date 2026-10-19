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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const username = localStorage.getItem("username");

    if (loggedInUser !== "true" || !username) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.post("/api/user/refresh");
        const { token, refreshToken } = res.data;

        setAuth(token);
        console.log("🔁 Refreshed AccessToken:", token);
        if (refreshToken) {
          console.log("📦 Existing RefreshToken:", refreshToken);
        }

        const role = await fetchRole();
        setUser({ username, role, isAdmin: role === "ROLE_ADMIN" });

        const lastPath = localStorage.getItem("lastPath");
        if (location.pathname === "/login" || location.pathname === "/") {
          navigate(lastPath || "/dashboard", { replace: true });
        }
      } catch (err) {
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, location.pathname]);

  const login = async (username, password) => {
    try {
      const res = await loginRequest(username, password);
      const token = res.token;
      const refreshToken = res.refreshToken;

      setAuth(token);
      console.log("🔐 AccessToken after login:", token);
      if (refreshToken) {
        console.log("📦 Login RefreshToken:", refreshToken);
      }

      localStorage.setItem("loggedInUser", "true");
      localStorage.setItem("username", username);

      const role = await fetchRole();
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
