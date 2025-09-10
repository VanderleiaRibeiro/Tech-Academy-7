import axios from "axios";
import { Platform } from "react-native";

function baseURL() {
  if (Platform.OS === "android") return "http://10.0.2.2:3001/api";
  return "http://localhost:3001/api";
  // telefone físico: retorne "http://SEU_IP:3001/api"
}

const api = axios.create({ baseURL: baseURL(), timeout: 10000 });

api.interceptors.request.use((config: any) => {
  console.log("[REQ]", config.method?.toUpperCase(), config.baseURL + config.url, config.data);
  return config;
});
api.interceptors.response.use(
  (res) => { console.log("[RES]", res.status, res.data); return res; },
  (err) => {
    if (err.response) {
      console.log("[ERR RES]", err.response.status, err.response.data);
    } else {
      console.log("[ERR NET]", err.message);
    }
    return Promise.reject(err);
  }
);

export default api;
