import React, { useState, useCallback } from "react";
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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { User, useUser } from "../../telas/contexts/UserContext";
import api from "@/api/api";

type RootStackParamList = {
  EditProfile: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

export default function EditProfileScreen({ navigation }: Props) {
  const { user, setUser, logout } = useUser();

  const [nome, setNome] = useState<string>(user?.name ?? "");
  const [email] = useState<string>(user?.email ?? "");
  const [senha, setSenha] = useState<string>("");
  const [confirmarSenha, setConfirmarSenha] = useState<string>("");
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [excluindo, setExcluindo] = useState<boolean>(false);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleUpdate = useCallback(async () => {
    try {
      if (!user?.id) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        return;
      }
      if (!nome.trim()) {
        Alert.alert("Atenção", "O nome não pode estar vazio.");
        return;
      }

      const payload: Record<string, unknown> = { name: nome.trim() };
      if (senha || confirmarSenha) {
        if (senha !== confirmarSenha) {
          Alert.alert("Erro", "As senhas não coincidem!");
          return;
        }
        const forte =
          senha.length >= 8 &&
          /[A-Z]/.test(senha) &&
          /\d/.test(senha) &&
          /[@$!%*?&]/.test(senha);
        if (!forte) {
          Alert.alert(
            "Senha fraca",
            "A senha deve ter 8+ caracteres, incluir 1 maiúscula, 1 número e 1 símbolo."
          );
          return;
        }
        payload.password = senha;
      }

      setSalvando(true);
      const { data: updated } = await api.put<User>(
        `/users/${user.id}`,
        payload
      );
      setUser(updated);
      Alert.alert("Sucesso", "Perfil atualizado!", [
        { text: "OK", onPress: goBack },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        (Array.isArray(e?.response?.data?.issues) &&
          e.response.data.issues[0]?.message) ??
        e?.message ??
        "Falha ao atualizar perfil.";
      Alert.alert("Erro", String(msg));
    } finally {
      setSalvando(false);
    }
  }, [user?.id, nome, senha, confirmarSenha, setUser, goBack]);

  const handleDelete = useCallback(() => {
    if (!user?.id) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }
    Alert.alert(
      "Excluir perfil",
      "Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setExcluindo(true);
              await api.delete(`/users/${user.id}`);
              await logout(navigation);
            } catch (e: any) {
              const msg =
                e?.response?.data?.message ??
                e?.message ??
                "Falha ao excluir a conta.";
              Alert.alert("Erro", String(msg));
            } finally {
              setExcluindo(false);
            }
          },
        },
      ]
    );
  }, [user?.id, logout, navigation]);

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
        <Text style={styles.title}>Editar Perfil</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: "#F3F4F6", color: "#6B7280" },
            ]}
            value={email}
            editable={false}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Senha (opcional)</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Nova senha (opcional)"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Ionicons
                name={mostrarSenha ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Confirmar Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Confirme a nova senha"
              secureTextEntry={!mostrarSenha}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <Ionicons
                name={mostrarSenha ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (salvando || excluindo) && { opacity: 0.7 }]}
          onPress={handleUpdate}
          disabled={salvando || excluindo}
        >
          <Text style={styles.buttonText}>
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            (salvando || excluindo) && { opacity: 0.7 },
          ]}
          onPress={handleDelete}
          disabled={salvando || excluindo}
        >
          <Text style={styles.deleteButtonText}>
            {excluindo ? "Excluindo..." : "Excluir Conta"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
