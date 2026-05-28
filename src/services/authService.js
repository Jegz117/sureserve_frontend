const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export const registerBuyer = async ({ fullName, email, password }) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password, role: "buyer" }),
  });
  return response.json();
};

export const loginBuyer = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "buyer" }),
  });
  return response.json();
};

export const loginSellerAccount = async ({ email, password }) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "seller" }),
  });
  return response.json();
};

export const saveAuthData = ({ token, user }) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getAuthToken = () => localStorage.getItem("token");

export const getUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});