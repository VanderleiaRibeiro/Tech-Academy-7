import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

function guessLanBase(): string {
  const hostUri: string =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants.manifest as any)?.debuggerHost ||
    "";
  const host = hostUri.split(":")[0];
  return host ? `http://${host}:3001` : "";
}

function getBaseUrl(): string {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra as any)?.API_URL;
  if (fromEnv) return `${fromEnv}/api`;

  const fromMetro = guessLanBase();
  if (fromMetro) return `${fromMetro}/api`;

  if (Platform.OS === "android") return "http://10.0.2.2:3001/api";
  return "http://localhost:3001/api";
}

const api = axios.create({ baseURL: getBaseUrl(), timeout: 10000 });

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
api.interceptors.request.use((config: any) => {
  console.log(
    "[REQ]",
    config.method?.toUpperCase(),
    config.baseURL + config.url,
    config.data
  );
  return config;
});
api.interceptors.response.use(
  (res) => {
    console.log("[RES]", res.status, res.data);
    return res;
  },
  (err) => {
    if (err.response)
      console.log("[ERR RES]", err.response.status, err.response.data);
    else console.log("[ERR NET]", err.message);
    return Promise.reject(err);
  }
);

export default api;
