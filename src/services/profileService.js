import { authHeaders } from "./authService";

const API_URL = "http://localhost:5000/api/profile";

export const getProfile = async () => {
  const res = await fetch(API_URL, { headers: authHeaders() });
  return res.json();
};

export const updateProfile = async (data) => {
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getDashboardStats = async () => {
  const res = await fetch(`${API_URL}/dashboard-stats`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const getSellerStats = async () => {
  const res = await fetch(`${API_URL}/seller-stats`, {
    headers: authHeaders(),
  });
  return res.json();
};
