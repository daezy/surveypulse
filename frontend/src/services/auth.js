import api from "./api";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

// Auth API calls
export const register = async (email, password, fullName = null) => {
  const response = await api.post("/auth/register", {
    email,
    password,
    full_name: fullName,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const { access_token, refresh_token } = response.data;

  // Store tokens
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

  // Fetch and store user info
  const user = await getCurrentUser();
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return response.data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await api.post("/auth/refresh", {
    refresh_token: refreshToken,
  });

  const { access_token, refresh_token: new_refresh_token } = response.data;

  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, new_refresh_token);

  return access_token;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Token management
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!getAccessToken();
};
