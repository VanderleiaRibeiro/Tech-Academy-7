import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Cores } from "../../constants/Colors";
import Cabecalho from "../../components/Cabecalho";
import api from "@/api/api";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type HabitDTO = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type RootStackParamList = {
  Habitos: undefined;
  CadastrarHabito: undefined;
  EditarHabito: { habito: HabitDTO };
};

type Nav = NativeStackNavigationProp<RootStackParamList, "Habitos">;

const HabitsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [habitos, setHabitos] = useState<HabitDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<HabitDTO[]>("/habits");
      setHabitos(data);
    } catch (e: any) {
      console.log("[HABITOS LIST ERR]", e?.response?.data || e?.message);
      setHabitos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const renderItem = ({ item }: { item: HabitDTO }) => (
    <TouchableOpacity
      style={styles.habitoItem}
      onPress={() => navigation.navigate("EditarHabito", { habito: item })}
    >
      <View style={styles.habitoInfo}>
        <Text style={styles.habitoNome}>{item.name}</Text>
        <View style={styles.habitoDetalhes}>
          {!!item.description && (
            <Text style={styles.habitoCategoria} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={Cores.claro.textoSecundario}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Cabecalho titulo="Meus Hábitos" />

      <View style={styles.conteudo}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} />
        ) : habitos.length === 0 ? (
          <View style={styles.vazioContainer}>
            <Ionicons
              name="list-outline"
              size={64}
              color={Cores.claro.textoSecundario}
            />
            <Text style={styles.vazioTexto}>Nenhum hábito cadastrado</Text>
            <Text style={styles.vazioSubtitulo}>
              Comece adicionando seu primeiro hábito para acompanhar sua rotina.
            </Text>
          </View>
        ) : (
          <FlatList
            data={habitos}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.lista}
          />
        )}

        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => navigation.navigate("CadastrarHabito")}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.botaoAdicionarTexto}>Cadastrar hábito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.claro.fundo },
  conteudo: { flex: 1, padding: 16 },
  lista: { paddingBottom: 16 },
  habitoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  habitoInfo: { flex: 1 },
  habitoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: Cores.claro.texto,
    marginBottom: 4,
  },
  habitoDetalhes: { flexDirection: "row" },
  habitoCategoria: {
    fontSize: 14,
    color: Cores.claro.textoSecundario,
    marginRight: 12,
  },
  habitoFrequencia: { fontSize: 14, color: Cores.claro.textoSecundario },
  vazioContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  vazioTexto: {
    fontSize: 18,
    fontWeight: "600",
    color: Cores.claro.texto,
    marginTop: 16,
    marginBottom: 8,
  },
  vazioSubtitulo: {
    fontSize: 14,
    color: Cores.claro.textoSecundario,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  botaoAdicionar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Cores.claro.tonalidade,
    padding: 16,
    borderRadius: 8,
    marginTop: "auto",
  },
  botaoAdicionarTexto: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default HabitsScreen;
