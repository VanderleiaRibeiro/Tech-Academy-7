import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Cores } from "../constantes/Cores";
import Cabecalho from "../componentes/Cabecalho";

const HabitsScreen = ({ navigation }) => {
  // Dados de exemplo - em um app real, viriam de um estado global ou API
  const [habitos, setHabitos] = useState([
    {
      id: "1",
      nome: "Beber 2L de água",
      categoria: "Saúde",
      frequencia: "Diário",
    },
    { id: "2", nome: "Correr", categoria: "Exercício", frequencia: "Diário" },
    {
      id: "3",
      nome: "Ler um livro",
      categoria: "Estudo",
      frequencia: "Diário",
    },
  ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.habitoItem}
      onPress={() => navigation.navigate("EditarHabito", { habito: item })}
    >
      <View style={styles.habitoInfo}>
        <Text style={styles.habitoNome}>{item.nome}</Text>
        <View style={styles.habitoDetalhes}>
          <Text style={styles.habitoCategoria}>{item.categoria}</Text>
          <Text style={styles.habitoFrequencia}>{item.frequencia}</Text>
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
        {habitos.length === 0 ? (
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
            keyExtractor={(item) => item.id}
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
  container: {
    flex: 1,
    backgroundColor: Cores.claro.fundo,
  },
  conteudo: {
    flex: 1,
    padding: 16,
  },
  lista: {
    paddingBottom: 16,
  },
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
  habitoInfo: {
    flex: 1,
  },
  habitoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: Cores.claro.texto,
    marginBottom: 4,
  },
  habitoDetalhes: {
    flexDirection: "row",
  },
  habitoCategoria: {
    fontSize: 14,
    color: Cores.claro.textoSecundario,
    marginRight: 12,
  },
  habitoFrequencia: {
    fontSize: 14,
    color: Cores.claro.textoSecundario,
  },
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
