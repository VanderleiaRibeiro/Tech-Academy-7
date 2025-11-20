import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/api";

export interface User {
  id: number;
  name: string | null;
  email: string;
  role: "admin" | "user";
  url_img?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type Ctx = {
  user: User | null;
  booting: boolean;
  login: (u: User, token: string) => Promise<void>;
  logout: (navigation?: any) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (u: User | null) => Promise<void>; // 👈 NOVO
};

const UserContext = createContext<Ctx | undefined>(undefined);
export { UserContext };

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, rawUser] = await Promise.all([
          AsyncStorage.getItem("@token"),
          AsyncStorage.getItem("@user"),
        ]);
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        if (rawUser) {
          setUser(JSON.parse(rawUser));
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const updateUser = async (u: User | null) => {
    if (u) {
      await AsyncStorage.setItem("@user", JSON.stringify(u));
      setUser(u);
    } else {
      await AsyncStorage.removeItem("@user");
      setUser(null);
    }
  };

  const login = async (u: User, token: string) => {
    await AsyncStorage.setItem("@token", token);
    await AsyncStorage.setItem("@user", JSON.stringify(u));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setUser(u);
  };

  const logout = async (_navigation?: any) => {
    await AsyncStorage.removeItem("@token");
    await AsyncStorage.removeItem("@user");
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, booting, login, logout, setUser, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser deve ser usado dentro de <UserProvider>");
  return ctx;
}
