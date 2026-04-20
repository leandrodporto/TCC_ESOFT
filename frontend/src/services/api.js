import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost";
const port = import.meta.env.VITE_API_PORT || "3000";

const api = axios.create({
  baseURL: `${baseURL}:${port}`,
});

export default api;
