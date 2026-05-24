import api from "./api";

// Register a new developer account
export const register = async (username, email, password) => {
  const response = await api.post("/users", { username, email, password });
  return response.data.data.developer;
};

// Log in and return the developer object
export const login = async (email, password) => {
  const response = await api.post("/users/login", { email, password });
  return response.data.data.developer;
};

// Clear the server-side session cookie
export const logout = async () => {
  await api.post("/users/logout");
};
