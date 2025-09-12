// src/api/api.ts
import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

function guessLanBase(): string {
  // Ex.: "192.168.69.84:8081"
  const hostUri: string =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants.manifest as any)?.debuggerHost ||
    "";
  const host = hostUri.split(":")[0];
  return host ? `http://${host}:3001` : "";
}

function getBaseUrl(): string {
  // 1) .env do Expo (cada dev usa o seu)
  const fromEnv =
    process.env.EXPO_PUBLIC_API_URL ||
    (Constants.expoConfig?.extra as any)?.API_URL;
  if (fromEnv) return `${fromEnv}/api`;

  // 2) Descobre automaticamente o IP do Metro (LAN)
  const fromMetro = guessLanBase();
  if (fromMetro) return `${fromMetro}/api`;

  // 3) Fallbacks (emuladores / web local)
  if (Platform.OS === "android") return "http://10.0.2.2:3001/api";
  return "http://localhost:3001/api";
}

const api = axios.create({ baseURL: getBaseUrl(), timeout: 10000 });

// logs (mantidos)
api.interceptors.request.use((config: any) => {
  console.log("[REQ]", config.method?.toUpperCase(), config.baseURL + config.url, config.data);
  return config;
});
api.interceptors.response.use(
  (res) => { console.log("[RES]", res.status, res.data); return res; },
  (err) => {
    if (err.response) console.log("[ERR RES]", err.response.status, err.response.data);
    else console.log("[ERR NET]", err.message);
    return Promise.reject(err);
  }
);

export default api;
