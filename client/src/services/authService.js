import api from "./api";

/**
 * Register User
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  if (response.token) {
    localStorage.setItem("token", response.token);
  }
  if (response.user) {
    localStorage.setItem("user", JSON.stringify(response.user));
  }
  return response;
};

/**
 * Login User
 */
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  if (response.token) {
    localStorage.setItem("token", response.token);
  }
  if (response.user) {
    localStorage.setItem("user", JSON.stringify(response.user));
  }
  return response;
};

/**
 * Get Current Logged-in User
 */
export const getCurrentUser = async () => {
  return api.get("/auth/me");
};

/**
 * Logout User
 */
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};