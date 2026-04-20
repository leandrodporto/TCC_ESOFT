import api from "./api";

const SESSION_KEY = "tcc_esoft_session";

export function getSession() {
  const rawSession = window.localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch {
    return null;
  }
}

export function initializeAuthHeader(session = getSession()) {
  if (session?.token) {
    api.defaults.headers.common.Authorization = `Bearer ${session.token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export function saveSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  initializeAuthHeader(session);
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  initializeAuthHeader(null);
}

export async function refreshSessionToken() {
  const session = getSession();

  if (!session?.token) {
    return null;
  }

  try {
    const response = await api.post("/auth/refresh", { token: session.token });
    const nextSession = {
      ...session,
      token: response.data.token,
    };

    saveSession(nextSession);
    return nextSession;
  } catch {
    clearSession();
    return null;
  }
}
