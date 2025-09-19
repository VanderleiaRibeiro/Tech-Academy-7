import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/api";

export type UserDTO = {
  id: number;
  name: string | null;
  email: string;
  url_img?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  user: UserDTO | null;
  booting: boolean;
  login: (user: UserDTO, token: string) => Promise<void>;
  logout: (navigation?: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, rawUser] = await Promise.all([
          AsyncStorage.getItem("@token"),
          AsyncStorage.getItem("@user"),
        ]);
        if (token)
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        if (rawUser) setUser(JSON.parse(rawUser));
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const login = async (u: UserDTO, token: string) => {
    await AsyncStorage.setItem("@token", token);
    await AsyncStorage.setItem("@user", JSON.stringify(u));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(u);
  };

  const logout = async (navigation?: any) => {
    await AsyncStorage.removeItem("@token");
    await AsyncStorage.removeItem("@user");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    navigation?.reset?.({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
