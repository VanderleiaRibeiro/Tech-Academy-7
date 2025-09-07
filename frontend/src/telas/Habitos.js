import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import Cabecalho from "../components/Cabecalho";

const TelaHabito = ({ navigation, route }) => {
  const { habito } = route.params || {};
  const estaEditando = !!habito;

  const [nome, setNome] = useState(habito?.nome || "");
  const [frequencia, setFrequencia] = useState(habito?.frequencia || "Diário");
  const [horario, setHorario] = useState(habito?.horario || "08:00");
  const [descricao, setDescricao] = useState(habito?.descricao || "");

  const manipularCriarHabito = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, informe um nome para o hábito");
      return;
    }
    Alert.alert("Sucesso", "Hábito criado com sucesso!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const manipularAtualizarHabito = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, informe um nome para o hábito");
      return;
    }
    Alert.alert("Sucesso", "Hábito atualizado com sucesso!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const manipularExcluirHabito = () => {
    Alert.alert(
      "Excluir Hábito",
      "Tem certeza que deseja excluir este hábito?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            Alert.alert("Sucesso", "Hábito excluído com sucesso!", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]),
        },
      ]
    );
  };

  return (
    <View style={estilos.container}>
      <Cabecalho titulo={estaEditando ? "Editar Hábito" : "Criar Hábito"} />

      <ScrollView style={estilos.conteudo}>
        <View style={estilos.grupoFormulario}>
          <Text style={estilos.rotulo}>Nome do Hábito *</Text>
          <TextInput
            style={estilos.entrada}
            placeholder="Ex: Beber água, Exercícios, etc."
            placeholderTextColor={Colors.light.icon}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={estilos.grupoFormulario}>
          <Text style={estilos.rotulo}>Frequência *</Text>
          <View style={estilos.containerSeletor}>
            <Picker
              selectedValue={frequencia}
              onValueChange={setFrequencia}
              style={estilos.seletor}
            >
              <Picker.Item label="Diário" value="Diário" />
              <Picker.Item label="Semanal" value="Semanal" />
              <Picker.Item label="Mensal" value="Mensal" />
            </Picker>
          </View>
        </View>

        <View style={estilos.grupoFormulario}>
          <Text style={estilos.rotulo}>Horário</Text>
          <TextInput
            style={estilos.entrada}
            placeholder="Ex: 08:00"
            placeholderTextColor={Colors.light.icon}
            value={horario}
            onChangeText={setHorario}
          />
        </View>

        <View style={estilos.grupoFormulario}>
          <Text style={estilos.rotulo}>Descrição (opcional)</Text>
          <TextInput
            style={[estilos.entrada, estilos.areaTexto]}
            placeholder="Descreva seu hábito..."
            placeholderTextColor={Colors.light.icon}
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={estilos.botaoPrincipal}
          onPress={
            estaEditando ? manipularAtualizarHabito : manipularCriarHabito
          }
        >
          <Text style={estilos.textoBotaoPrincipal}>
            {estaEditando ? "Atualizar Hábito" : "Criar Hábito"}
          </Text>
        </TouchableOpacity>

        {estaEditando && (
          <TouchableOpacity
            style={estilos.botaoExcluir}
            onPress={manipularExcluirHabito}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={estilos.textoBotaoExcluir}>Excluir Hábito</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  conteudo: {
    flex: 1,
    padding: 16,
  },
  grupoFormulario: {
    marginBottom: 20,
  },
  rotulo: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  entrada: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  areaTexto: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  containerSeletor: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  seletor: {
    height: 50,
  },
  botaoPrincipal: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  textoBotaoPrincipal: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoExcluir: {
    backgroundColor: "#FF3B30",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  textoBotaoExcluir: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default TelaHabito;
