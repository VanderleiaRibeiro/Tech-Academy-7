// src/telas/ResetPassword/ResetPassword.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Cabecalho from "../../components/Cabecalho";
import { Cores } from "../../constants/Colors";
import api from "@/api/api";

type Mode = "reset" | "loggedIn";
type Params = { token?: string; mode?: Mode };

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token: tokenFromParams, mode = "reset" } = (route.params ??
    {}) as Params;

  const isLoggedInMode = mode === "loggedIn";
  const headerTitle = isLoggedInMode ? "Alterar senha" : "Redefinir senha";

  const [token, setToken] = useState<string>(tokenFromParams ?? "");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // visibilidade dos campos de senha
  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (tokenFromParams) setToken(tokenFromParams);
  }, [tokenFromParams]);

  async function handleSubmit() {
    const p = (newPassword ?? "").trim();
    if (p.length < 8) {
      Alert.alert("Atenção", "A nova senha deve ter ao menos 8 caracteres");
      return;
    }
    if (p !== (confirm ?? "").trim()) {
      Alert.alert("Atenção", "As senhas não conferem");
      return;
    }

    try {
      setLoading(true);

      if (isLoggedInMode) {
        await api.post("/users/change-password", {
          currentPassword: (currentPassword ?? "").trim(),
          newPassword: p,
        });
      } else {
        await api.post("/users/reset-password", {
          token: token.trim(),
          password: p,
        });
      }

      Alert.alert(
        "Sucesso",
        isLoggedInMode
          ? "Senha alterada com sucesso."
          : "Senha redefinida. Faça login novamente.",
        [
          {
            text: "OK",
            onPress: () => {
              if (isLoggedInMode) {
                navigation.goBack();
              } else {
                navigation.dispatch(
                  CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
                );
              }
            },
          },
        ]
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (err?.response?.status === 401
          ? "Senha atual incorreta."
          : err?.message ?? "Falha ao alterar senha.");
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Cores.claro.fundo }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Cabecalho
            titulo={headerTitle}
            mostrarVoltar
            onVoltar={() => navigation.goBack()}
          />

          <Text style={styles.helper}>
            Sua nova senha deve ter pelo menos 8 caracteres.
          </Text>

          {!isLoggedInMode ? (
            <>
              <Text style={styles.label}>Token</Text>
              <TextInput
                style={styles.input}
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                placeholder="Cole o token recebido"
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Senha atual</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Digite sua senha atual"
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowCurrent((v) => !v)}
                >
                  <Ionicons
                    name={showCurrent ? "eye-off" : "eye"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.label}>Nova senha</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Digite a nova senha"
              secureTextEntry={!showNew}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowNew((v) => !v)}
            >
              <Ionicons
                name={showNew ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar nova senha</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Confirme a nova senha"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConfirm((v) => !v)}
            >
              <Ionicons
                name={showConfirm ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnSalvar, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={styles.btnSalvarText}>
              {loading
                ? "Salvando..."
                : isLoggedInMode
                ? "Salvar nova senha"
                : "Redefinir"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Cores.claro.fundo,
  },
  helper: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 12,
    fontSize: 13,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Cores.claro.texto,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    color: "#111",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  inputFlex: { flex: 1, padding: 12, fontSize: 15, color: "#111" },
  eyeBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  btnSalvar: {
    backgroundColor: Cores.claro.tonalidade,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnSalvarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
