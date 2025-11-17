import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./styles";
import Cabecalho from "../../components/Cabecalho";
import { useUser } from "../../telas/contexts/UserContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import api from "@/api/api";
import { Cores } from "../../constants/Colors";

type UserDTO = {
  id: number;
  name: string | null;
  email: string;
  url_img?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type AuthResponse = {
  user: UserDTO;
  token: string;
};

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  MainTabs: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post<AuthResponse>("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = data;
      if (!token) throw new Error("Token ausente na resposta.");

      const baseUrl =
        (api.defaults.baseURL as string | undefined) ??
        process.env.EXPO_PUBLIC_API_URL ??
        "";

      const finalUser: UserDTO = {
        ...user,
        url_img:
          user.url_img && baseUrl
            ? `${baseUrl}${user.url_img}`
            : user.url_img ?? null,
      };

      await login(finalUser, token);

      Alert.alert(
        "Sucesso",
        `Bem-vindo, ${finalUser?.name ?? finalUser?.email}!`
      );
    } catch (e: any) {
      const status = e?.response?.status;
      const messageFromApi =
        e?.response?.data?.message ??
        (Array.isArray(e?.response?.data?.issues) &&
          e.response.data.issues[0]?.message);

      const friendly =
        messageFromApi ??
        (status === 401
          ? "Senha inválida."
          : status === 404
          ? "Usuário não encontrado."
          : e?.message === "Network Error"
          ? "Sem conexão com a API. Confira a baseURL/porta."
          : "Falha no login.");

      console.log("[LOGIN ERR]", {
        status,
        resp: e?.response?.data,
        message: e?.message,
      });
      Alert.alert("Ops", String(friendly));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Cores.claro.fundo }}>
      <Cabecalho titulo="RVM Routine" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Entrar</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Digite sua senha"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.linkText}>Esqueci a senha</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.linkText}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
