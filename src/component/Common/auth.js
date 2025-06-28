
import axios from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export const validateToken = async (token) => {
  try {
    const response = await api.post(
      "http://127.0.0.1:8000/api/validate-token/",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      isValid: response.data.isValid,
      user: response.data.user,
      expiresAt: response.data.expiresAt,
    };
  } catch (error) {
    console.error("Token validation error:", error);
    if (error.response) {
      // Server responded with a status other than 2xx
      if (error.response.status === 401) {
        return {
          isValid: false,
          error: error.response.data.error || "Token expired or invalid",
        };
      }
      return {
        isValid: false,
        error: error.response.data.error || "Validation failed",
      };
    } else if (error.request) {
      // Request was made but no response received
      return { isValid: false, error: "Network error or server unreachable" };
    } else {
      // Something else happened
      return { isValid: false, error: "An unexpected error occurred" };
    }
  }
};
