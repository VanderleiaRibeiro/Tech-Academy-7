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
import { styles } from "./styles";
import Cabecalho from "../../components/Cabecalho";
import { useUser } from "../../telas/contexts/UserContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import api from "@/api/api";

// ===== Tipos =====
type UserDTO = {
  id: number;
  name: string | null;
  email: string;
  url_img?: string | null;
  description?: string | null;
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
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useUser(); // << usar o contexto

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      // baseURL já tem /api → use /users/login
      const { data } = await api.post<AuthResponse>("/users/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = data;
      if (!token) throw new Error("Token ausente na resposta.");

      // Persistir via contexto (AsyncStorage + axios + state)
      await login(user, token);

      Alert.alert("Sucesso", `Bem-vindo, ${user?.name ?? user?.email}!`);
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" as never }] });
    } catch (e: any) {
      const status = e?.response?.status;
      const messageFromApi =
        e?.response?.data?.message ??
        (Array.isArray(e?.response?.data?.issues) && e.response.data.issues[0]?.message);

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Cabecalho />
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
            onPress={() =>
              Alert.alert(
                "Em breve",
                "Fluxo de recuperação de senha ainda não implementado."
              )
            }
          >
            <Text style={styles.linkText}>Esqueci a senha</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.linkText}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
