import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Cabecalho from "../../components/Cabecalho";
import { Cores } from "../../constants/Colors";
import api from "@/api/api";
import { useUser } from "@/telas/contexts/UserContext";

type AdminUser = {
  id: number;
  name: string | null;
  email: string;
  role: "admin" | "user";
};

export default function AdminUsersScreen() {
  const navigation = useNavigation<any>();
  const { user } = useUser();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function carregarUsuarios(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      const { data } = await api.get<{ users: AdminUser[] }>(
        "/auth/admin/users"
      );
      setUsers(data.users ?? []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Falha ao carregar usuários.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregarUsuarios();
    }, [])
  );

  useEffect(() => {
    if (user && user.role !== "admin") {
      Alert.alert(
        "Acesso negado",
        "Esta área é exclusiva para administradores.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [user, navigation]);

  async function handleDelete(u: AdminUser) {
    if (!u.id) return;

    Alert.alert(
      "Excluir usuário",
      `Tem certeza que deseja excluir o usuário "${u.name ?? u.email}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/auth/users/${u.id}`);
              setUsers((prev) => prev.filter((item) => item.id !== u.id));
            } catch (err: any) {
              const msg =
                err?.response?.data?.message ??
                err?.message ??
                "Falha ao excluir usuário.";
              Alert.alert("Erro", msg);
            }
          },
        },
      ]
    );
  }

  function renderItem({ item }: { item: AdminUser }) {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.name || "Sem nome"}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <Text style={styles.role}>
            Papel:{" "}
            <Text style={{ fontWeight: "600" }}>
              {item.role === "admin" ? "Administrador" : "Usuário"}
            </Text>
          </Text>
        </View>

        {user?.id !== item.id && (
          <TouchableOpacity
            style={styles.btnExcluir}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Cabecalho
        titulo="Painel Admin"
        mostrarVoltar
        onVoltar={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando usuários...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={
            users.length === 0 ? styles.center : styles.listContainer
          }
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            carregarUsuarios(false);
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
          }
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Cores.claro.fundo,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  nome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  email: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 2,
  },
  role: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  btnExcluir: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    marginLeft: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
  },
});
