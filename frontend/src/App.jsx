import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Places from "./pages/Places";
import Municipalities from "./pages/Municipalities";
import NotaryOffices from "./pages/NotaryOffices";
import Users from "./pages/Users";
import Routers from "./pages/Routers";

import {
  clearSession,
  getSession,
  initializeAuthHeader,
  refreshSessionToken,
  saveSession,
} from "./services/auth";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    initializeAuthHeader(session);
  }, [session]);

  useEffect(() => {
    if (!session?.token) {
      return undefined;
    }

    const refreshTimer = window.setInterval(async () => {
      const nextSession = await refreshSessionToken();
      setSession(nextSession);
    }, 45 * 60 * 1000);

    return () => window.clearInterval(refreshTimer);
  }, [session?.token]);

  const isAuthenticated = Boolean(session?.token);

  function handleLogin(authData) {
    saveSession(authData);
    setSession(authData);
    navigate("/", { replace: true });
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    navigate("/login", { replace: true });
  }

  const protectedProps = {
    onLogout: handleLogout,
    user: session?.user ?? null,
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate replace to="/" />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard {...protectedProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/places"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Places {...protectedProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/municipalities"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Municipalities {...protectedProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notary-offices"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <NotaryOffices {...protectedProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Users {...protectedProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routers"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Routers {...protectedProps} />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate replace to={isAuthenticated ? "/" : "/login"} />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
