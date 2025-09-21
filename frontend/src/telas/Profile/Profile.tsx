import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { profileStyles as styles } from "./profile.styles";
import Cabecalho from "../../components/Cabecalho";
import { useUser } from "../../telas/contexts/UserContext";

function Row({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={20} color={danger ? "#EF4444" : "#111827"} />
      <Text style={[styles.rowText, danger && { color: "#EF4444" }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const Profile: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useUser();

  const editarPerfil = useCallback(() => {
    navigation.navigate("EditProfile");
  }, [navigation]);

  const alterarSenha = useCallback(() => {
    navigation.navigate("ResetPassword", { mode: "loggedIn" });
  }, [navigation]);

  const sair = useCallback(() => {
    Alert.alert("Sair", "Deseja realmente sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout() },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Cabecalho titulo="Perfil" />

          <View style={styles.centerBox}>
            <View style={styles.avatar} />
            <Text style={styles.name}>{user?.name ?? "Usuário"}</Text>
            <Text style={styles.email}>
              {user?.email ?? "email@exemplo.com"}
            </Text>
          </View>

          <View style={styles.list}>
            <Row
              icon="create-outline"
              label="Editar Perfil"
              onPress={editarPerfil}
            />
            <Row
              icon="key-outline"
              label="Alterar Senha"
              onPress={alterarSenha}
            />
            <Row
              icon="log-out-outline"
              label="Sair da Conta"
              danger
              onPress={sair}
            />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Profile;
