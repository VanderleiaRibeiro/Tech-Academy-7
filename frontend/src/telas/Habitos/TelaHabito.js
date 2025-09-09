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
import { Ionicons } from "@expo/vector-icons";
import { Cores } from "../constants/Colors";
import Cabecalho from "../components/Cabecalho";

const EditHabitScreen = ({ navigation, route }) => {
  const { habito } = route.params || {};
  const estaEditando = !!habito;

  const [nome, setNome] = useState(habito?.nome || "");
  const [categoria, setCategoria] = useState(habito?.categoria || "Saúde");
  const [frequencia, setFrequencia] = useState(habito?.frequencia || "Diário");
  const [horarios, setHorarios] = useState(habito?.horarios || ["08:00"]);
  const [notificacoes, setNotificacoes] = useState(
    habito?.notificacoes || true
  );

  const categorias = [
    "Saúde",
    "Exercício",
    "Estudo",
    "Bem-estar",
    "Casa",
    "Trabalho",
    "Outro",
  ];
  const frequencias = ["Diário", "Semanal", "Personalizado"];

  const adicionarHorario = () => {
    setHorarios([...horarios, "08:00"]);
  };

  const removerHorario = (index) => {
    if (horarios.length > 1) {
      const novosHorarios = [...horarios];
      novosHorarios.splice(index, 1);
      setHorarios(novosHorarios);
    }
  };

  const atualizarHorario = (index, valor) => {
    const novosHorarios = [...horarios];
    novosHorarios[index] = valor;
    setHorarios(novosHorarios);
  };

  const manipularSalvar = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, informe um nome para o hábito");
      return;
    }

    Alert.alert(
      "Sucesso",
      `Hábito ${estaEditando ? "atualizado" : "criado"} com sucesso!`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  const manipularExcluir = () => {
    Alert.alert(
      "Excluir Hábito",
      "Tem certeza que deseja excluir este hábito?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            // Aqui você excluiria o hábito
            Alert.alert("Sucesso", "Hábito excluído com sucesso!", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Cabecalho
        titulo={estaEditando ? "Editar Hábito" : "Novo Hábito"}
        mostrarVoltar
        onVoltar={() => navigation.goBack()}
      />

      <ScrollView style={styles.conteudo}>
        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Nome do Hábito</Text>
          <TextInput
            style={styles.entrada}
            placeholder="Ex: Beber 2L de água"
            placeholderTextColor={Cores.claro.textoSecundario}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Categoria</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriasContainer}
          >
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoriaItem,
                  categoria === cat && styles.categoriaSelecionada,
                ]}
                onPress={() => setCategoria(cat)}
              >
                <Text
                  style={[
                    styles.categoriaTexto,
                    categoria === cat && styles.categoriaTextoSelecionado,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Frequência</Text>
          <View style={styles.frequenciasContainer}>
            {frequencias.map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequenciaItem,
                  frequencia === freq && styles.frequenciaSelecionada,
                ]}
                onPress={() => setFrequencia(freq)}
              >
                <Text
                  style={[
                    styles.frequenciaTexto,
                    frequencia === freq && styles.frequenciaTextoSelecionado,
                  ]}
                >
                  {freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Horários (Lembretes)</Text>
          {horarios.map((horario, index) => (
            <View key={index} style={styles.horarioContainer}>
              <TextInput
                style={[styles.entrada, styles.horarioInput]}
                placeholder="HH:MM"
                placeholderTextColor={Cores.claro.textoSecundario}
                value={horario}
                onChangeText={(texto) => atualizarHorario(index, texto)}
              />
              <TouchableOpacity
                style={styles.botaoRemoverHorario}
                onPress={() => removerHorario(index)}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={Cores.claro.perigo}
                />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.botaoAdicionarHorario}
            onPress={adicionarHorario}
          >
            <Ionicons
              name="add-circle"
              size={20}
              color={Cores.claro.tonalidade}
            />
            <Text style={styles.botaoAdicionarHorarioTexto}>
              + Adicionar horário
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Notificações</Text>
          <TouchableOpacity
            style={styles.notificacaoToggle}
            onPress={() => setNotificacoes(!notificacoes)}
          >
            <Text style={styles.notificacaoTexto}>Receber lembretes</Text>
            <View style={[styles.toggle, notificacoes && styles.toggleAtivo]}>
              <View
                style={[
                  styles.togglePonto,
                  notificacoes && styles.togglePontoAtivo,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={manipularSalvar}
        >
          <Text style={styles.textoBotaoPrincipal}>
            {estaEditando ? "Salvar Alterações" : "Salvar Hábito"}
          </Text>
        </TouchableOpacity>

        {estaEditando && (
          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={manipularExcluir}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.textoBotaoExcluir}>Excluir Hábito</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  grupoFormulario: {
    marginBottom: 24,
  },
  rotulo: {
    fontSize: 16,
    fontWeight: "600",
    color: Cores.claro.texto,
    marginBottom: 12,
  },
  entrada: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Cores.claro.borda,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Cores.claro.texto,
  },
  categoriasContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  categoriaItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Cores.claro.borda,
    marginRight: 8,
    backgroundColor: "white",
  },
  categoriaSelecionada: {
    backgroundColor: Cores.claro.tonalidade,
    borderColor: Cores.claro.tonalidade,
  },
  categoriaTexto: {
    color: Cores.claro.texto,
  },
  categoriaTextoSelecionado: {
    color: "white",
    fontWeight: "600",
  },
  frequenciasContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Cores.claro.borda,
    overflow: "hidden",
  },
  frequenciaItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  frequenciaSelecionada: {
    backgroundColor: Cores.claro.tonalidade,
  },
  frequenciaTexto: {
    color: Cores.claro.texto,
  },
  frequenciaTextoSelecionado: {
    color: "white",
    fontWeight: "600",
  },
  horarioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  horarioInput: {
    flex: 1,
    marginRight: 8,
  },
  botaoRemoverHorario: {
    padding: 4,
  },
  botaoAdicionarHorario: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  botaoAdicionarHorarioTexto: {
    color: Cores.claro.tonalidade,
    marginLeft: 4,
    fontWeight: "600",
  },
  notificacaoToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Cores.claro.borda,
  },
  notificacaoTexto: {
    color: Cores.claro.texto,
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    padding: 2,
    justifyContent: "center",
  },
  toggleAtivo: {
    backgroundColor: Cores.claro.tonalidade,
  },
  togglePonto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },
  togglePontoAtivo: {
    transform: [{ translateX: 22 }],
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

export default EditHabitScreen;
