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
import { Cores } from "../../constants/Colors";
import Cabecalho from "../../components/Cabecalho";
import api from "@/api/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  CadastrarHabito: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "CadastrarHabito">;

const AddHabitScreen: React.FC<Props> = ({ navigation }) => {
  const [nome, setNome] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Saúde");
  const [frequencia, setFrequencia] = useState<string>("Diário");
  const [horarios, setHorarios] = useState<string[]>(["08:00"]);
  const [notificacoes, setNotificacoes] = useState<boolean>(true);

  const categorias = ["Saúde", "Exercício", "Estudo", "Bem-estar", "Casa", "Trabalho"];
  const frequencias = ["Diário", "Semanal", "Personalizado"];

  const adicionarHorario = () => setHorarios((prev) => [...prev, "08:00"]);

  const removerHorario = (index: number) => {
    if (horarios.length > 1) {
      setHorarios((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const atualizarHorario = (index: number, valor: string) => {
    setHorarios((prev) => prev.map((h, i) => (i === index ? valor : h)));
  };

  const manipularSalvar = async () => {
    try {
      if (!nome.trim()) {
        Alert.alert("Erro", "Por favor, informe um nome para o hábito");
        return;
      }

      // agrega os campos visuais na description (back atual: name/description)
      const description =
        `Categoria: ${categoria} | Frequência: ${frequencia} | ` +
        `Horários: ${horarios.join(", ")} | Notificações: ${notificacoes ? "on" : "off"}`;

      await api.post("/habits", { name: nome.trim(), description });

      Alert.alert("Sucesso", "Hábito criado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Falha ao cadastrar hábito";
      Alert.alert("Erro", String(msg));
    }
  };

  return (
    <View style={styles.container}>
      <Cabecalho titulo="Cadastrar Hábito" />

      <ScrollView style={styles.conteudo}>
        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Nome do Hábito</Text>
          <TextInput
            style={styles.entrada}
            placeholder="Ex: Beber água, Correr, Ler..."
            placeholderTextColor={Cores.claro.textoSecundario}
            value={nome}
            onChangeText={setNome}
          />
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasContainer}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoriaItem, categoria === cat && styles.categoriaSelecionada]}
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
                style={[styles.frequenciaItem, frequencia === freq && styles.frequenciaSelecionada]}
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
          <Text style={styles.rotulo}>Horários</Text>
          {horarios.map((horario, index) => (
            <View key={index} style={styles.horarioContainer}>
              <TextInput
                style={[styles.entrada, styles.horarioInput]}
                placeholder="HH:MM"
                placeholderTextColor={Cores.claro.textoSecundario}
                value={horario}
                onChangeText={(texto) => atualizarHorario(index, texto)}
              />
              {horarios.length > 1 && (
                <TouchableOpacity style={styles.botaoRemoverHorario} onPress={() => removerHorario(index)}>
                  <Ionicons name="close-circle" size={24} color={Cores.claro.perigo} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.botaoAdicionarHorario} onPress={adicionarHorario}>
            <Ionicons name="add-circle" size={20} color={Cores.claro.tonalidade} />
            <Text style={styles.botaoAdicionarHorarioTexto}>Adicionar horário</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Notificações</Text>
          <TouchableOpacity
            style={styles.notificacaoToggle}
            onPress={() => setNotificacoes((v) => !v)}
          >
            <Text style={styles.notificacaoTexto}>Receber lembretes</Text>
            <View style={[styles.toggle, notificacoes && styles.toggleAtivo]}>
              <View style={[styles.togglePonto, notificacoes && styles.togglePontoAtivo]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botaoPrincipal} onPress={manipularSalvar}>
          <Text style={styles.textoBotaoPrincipal}>Salvar Hábito</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.claro.fundo },
  conteudo: { flex: 1, padding: 16 },
  grupoFormulario: { marginBottom: 24 },
  rotulo: { fontSize: 16, fontWeight: "600", color: Cores.claro.texto, marginBottom: 12 },
  entrada: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Cores.claro.borda,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Cores.claro.texto,
  },
  categoriasContainer: { flexDirection: "row", marginBottom: 8 },
  categoriaItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Cores.claro.borda,
    marginRight: 8,
    backgroundColor: "white",
  },
  categoriaSelecionada: { backgroundColor: Cores.claro.tonalidade, borderColor: Cores.claro.tonalidade },
  categoriaTexto: { color: Cores.claro.texto },
  categoriaTextoSelecionado: { color: "white", fontWeight: "600" },
  frequenciasContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Cores.claro.borda,
    overflow: "hidden",
  },
  frequenciaItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  frequenciaSelecionada: { backgroundColor: Cores.claro.tonalidade },
  frequenciaTexto: { color: Cores.claro.texto },
  frequenciaTextoSelecionado: { color: "white", fontWeight: "600" },
  horarioContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  horarioInput: { flex: 1, marginRight: 8 },
  botaoRemoverHorario: { padding: 4 },
  botaoAdicionarHorario: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  botaoAdicionarHorarioTexto: { color: Cores.claro.tonalidade, marginLeft: 4, fontWeight: "600" },
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
  notificacaoTexto: { color: Cores.claro.texto, fontSize: 16 },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: "#E0E0E0", padding: 2, justifyContent: "center" },
  toggleAtivo: { backgroundColor: Cores.claro.tonalidade },
  togglePonto: { width: 24, height: 24, borderRadius: 12, backgroundColor: "white" },
  togglePontoAtivo: { transform: [{ translateX: 22 }] },
  botaoPrincipal: {
    backgroundColor: Cores.claro.tonalidade,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  textoBotaoPrincipal: { color: "white", fontSize: 16, fontWeight: "600" },
});

export default AddHabitScreen;
