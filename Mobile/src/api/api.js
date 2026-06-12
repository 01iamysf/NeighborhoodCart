import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// 192.168.1.39 is your computer's LAN IP, needed when testing on a physical phone via Expo Go.
const API_URL = Platform.OS === "web" 
  ? "http://localhost:3001" 
  : "http://192.168.1.39:3001";

const API = axios.create({
  baseURL: API_URL,
  timeout: 8000, // 8 seconds timeout so it doesn't spin forever on network failure
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to all requests
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error fetching token from storage:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
export { API_URL };
