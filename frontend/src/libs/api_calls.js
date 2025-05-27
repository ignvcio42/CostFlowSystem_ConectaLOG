import axios from "axios";
import { toast } from "sonner";

const API_URL = `http://localhost:5000/api-v1`;

const api = axios.create({
  baseURL: API_URL,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// INTERCEPTOR GLOBAL PARA TOKEN EXPIRADO
api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.data?.message?.toLowerCase().includes("jwt expired"))
    ) {
      localStorage.removeItem("user");
      // GUARDAR FLAG
      localStorage.setItem("sessionExpired", "1");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);


export default api;
