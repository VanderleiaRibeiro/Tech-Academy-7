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
import { Cores } from "../constants/Colors";
import Cabecalho from "../components/Cabecalho";

const TelaHabito = ({ navegacao, route }) => {
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
      { texto: "OK", onPress: () => navegacao.goBack() },
    ]);
  };

  const manipularAtualizarHabito = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, informe um nome para o hábito");
      return;
    }

    Alert.alert("Sucesso", "Hábito atualizado com sucesso!", [
      { texto: "OK", onPress: () => navegacao.goBack() },
    ]);
  };

  const manipularExcluirHabito = () => {
    Alert.alert(
      "Excluir Hábito",
      "Tem certeza que deseja excluir este hábito?",
      [
        { texto: "Cancelar", estilo: "cancelar" },
        {
          texto: "Excluir",
          estilo: "destrutivo",
          onPress: () => {
            Alert.alert("Sucesso", "Hábito excluído com sucesso!", [
              { texto: "OK", onPress: () => navegacao.goBack() },
            ]);
          },
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
            placeholderTextColor={Cores.claro.icone}
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
            placeholderTextColor={Cores.claro.icone}
            value={horario}
            onChangeText={setHorario}
          />
        </View>

        <View style={estilos.grupoFormulario}>
          <Text style={estilos.rotulo}>Descrição (opcional)</Text>
          <TextInput
            style={[estilos.entrada, estilos.areaTexto]}
            placeholder="Descreva seu hábito..."
            placeholderTextColor={Cores.claro.icone}
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
    backgroundColor: Cores.claro.fundo,
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
    color: Cores.claro.texto,
    marginBottom: 8,
  },
  entrada: {
    backgroundColor: Cores.claro.fundoEntrada,
    borderWidth: 1,
    borderColor: Cores.claro.bordaEntrada,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Cores.claro.texto,
  },
  areaTexto: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  containerSeletor: {
    backgroundColor: Cores.claro.fundoEntrada,
    borderWidth: 1,
    borderColor: Cores.claro.bordaEntrada,
    borderRadius: 8,
    overflow: "hidden",
  },
  seletor: {
    height: 50,
  },
  botaoPrincipal: {
    backgroundColor: Cores.claro.tonalidade,
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
    backgroundColor: Cores.claro.perigo,
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
