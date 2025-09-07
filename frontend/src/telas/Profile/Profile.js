import React, { useCallback, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./styles";
import Cabecalho from "../../components/Cabecalho";

import { UserContext } from "../../telas/contexts/UserContext";

function Row({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? "#EF4444" : "#111827"} />
      <Text style={[styles.rowText, danger && { color: "#EF4444" }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

export default function Profile() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const goBack = useCallback(() => {
    navigation.goBack?.();
  }, [navigation]);

  const logout = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }, [navigation]);

  const editarPerfil = useCallback(() => {
    navigation.navigate("EditarPerfil");
  }, [navigation]);

  const alterarSenha = useCallback(() => {
    navigation.navigate("AlterarSenha");
  }, [navigation]);

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

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Dados do usuário */}
        <View style={styles.centerBox}>
          <View style={styles.avatar} />
          <Text style={styles.name}>{user?.name || "Usuário"}</Text>
          <Text style={styles.email}>{user?.email || "email@exemplo.com"}</Text>
        </View>

        {/* Lista de ações */}
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
            onPress={logout}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
