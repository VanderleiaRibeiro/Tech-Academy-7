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

// ===== Tipos =====
export type HabitDTO = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RootStackParamList = {
  EditarHabito: { habito: HabitDTO | any }; // aceita também o objeto antigo com 'nome'
  Habitos: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "EditarHabito">;

const EditHabitScreen: React.FC<Props> = ({ navigation, route }) => {
  const { habito } = route.params || {};
  const estaEditando = !!habito;

  // aceita tanto o shape antigo (nome) quanto o novo (name)
  const [nome, setNome] = useState<string>(habito?.name ?? habito?.nome ?? "");
  const [categoria, setCategoria] = useState<string>(habito?.categoria ?? "Saúde");
  const [frequencia, setFrequencia] = useState<string>(habito?.frequencia ?? "Diário");
  const [horarios, setHorarios] = useState<string[]>(
    Array.isArray(habito?.horarios) ? habito.horarios : ["08:00"]
  );
  const [notificacoes, setNotificacoes] = useState<boolean>(
    typeof habito?.notificacoes === "boolean" ? habito.notificacoes : true
  );

  const categorias = ["Saúde", "Exercício", "Estudo", "Bem-estar", "Casa", "Trabalho", "Outro"];
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

      // agrega campos visuais na description (back atual salva name/description)
      const description =
        `Categoria: ${categoria} | Frequência: ${frequencia} | ` +
        `Horários: ${horarios.join(", ")} | Notificações: ${notificacoes ? "on" : "off"}`;

      if (!estaEditando || !habito?.id) {
        Alert.alert("Erro", "Hábito inválido para edição");
        return;
      }

      await api.put(`/habits/${habito.id}`, {
        name: nome.trim(),
        description,
      });

      Alert.alert("Sucesso", "Hábito atualizado com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Falha ao atualizar hábito";
      Alert.alert("Erro", String(msg));
    }
  };

  const manipularExcluir = () => {
    Alert.alert("Excluir Hábito", "Tem certeza que deseja excluir este hábito?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            if (!habito?.id) {
              Alert.alert("Erro", "Hábito inválido");
              return;
            }
            await api.delete(`/habits/${habito.id}`);
            Alert.alert("Sucesso", "Hábito excluído com sucesso!", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (e: any) {
            const msg = e?.response?.data?.error || e?.message || "Falha ao excluir hábito";
            Alert.alert("Erro", String(msg));
          }
        },
      },
    ]);
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
              <TouchableOpacity style={styles.botaoRemoverHorario} onPress={() => removerHorario(index)}>
                <Ionicons name="close-circle" size={24} color={Cores.claro.perigo} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.botaoAdicionarHorario} onPress={adicionarHorario}>
            <Ionicons name="add-circle" size={20} color={Cores.claro.tonalidade} />
            <Text style={styles.botaoAdicionarHorarioTexto}>+ Adicionar horário</Text>
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
          <Text style={styles.textoBotaoPrincipal}>
            {estaEditando ? "Salvar Alterações" : "Salvar Hábito"}
          </Text>
        </TouchableOpacity>

        {estaEditando && (
          <TouchableOpacity style={styles.botaoExcluir} onPress={manipularExcluir}>
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.textoBotaoExcluir}>Excluir Hábito</Text>
          </TouchableOpacity>
        )}
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
  botaoExcluir: {
    backgroundColor: Cores.claro.perigo,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  textoBotaoExcluir: { color: "white", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});

export default EditHabitScreen;
