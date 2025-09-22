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
import { SafeAreaView } from "react-native-safe-area-context";
import { editStyles as styles } from "./editProfile.styles";
import Cabecalho from "../../components/Cabecalho";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { User, useUser } from "../../telas/contexts/UserContext";
import { Cores } from "../../constants/Colors";
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
  const [salvando, setSalvando] = useState<boolean>(false);
  const [excluindo, setExcluindo] = useState<boolean>(false);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleUpdate = useCallback(async () => {
    try {
      if (!user?.id) {
        Alert.alert("Sessão expirada", "Faça login novamente.");
        return;
      }
      const trimmed = nome.trim();
      if (!trimmed) {
        Alert.alert("Atenção", "O nome não pode estar vazio.");
        return;
      }

      setSalvando(true);
      const { data: updated } = await api.put<User>(`/users/${user.id}`, {
        name: trimmed,
      });

      setUser(updated ?? { ...user, name: trimmed });

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
  }, [user, nome, setUser, goBack]);

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
              await logout();
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
  }, [user, logout]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Cores.claro.fundo }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { flexGrow: 1, backgroundColor: Cores.claro.fundo },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Cabecalho titulo="Editar Perfil" mostrarVoltar onVoltar={goBack} />

          <Text
            style={{
              marginTop: 4,
              marginBottom: 12,
              color: "#6B7280",
              textAlign: "center",
            }}
          >
            Atualize seu nome. O e-mail não pode ser alterado.
          </Text>

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

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
