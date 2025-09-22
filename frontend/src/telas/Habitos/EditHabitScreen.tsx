import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { Cores } from "../../constants/Colors";
import Cabecalho from "../../components/Cabecalho";
import api from "@/api/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type HabitDTO = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RootStackParamList = {
  EditarHabito: { habito: HabitDTO | Record<string, unknown> };
  Habitos: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "EditarHabito">;

const CATEGORIAS = [
  "Saúde",
  "Exercício",
  "Estudo",
  "Bem-estar",
  "Casa",
  "Trabalho",
  "Outro",
] as const;

const FREQUENCIAS = ["Diário", "Semanal", "Personalizado"] as const;

function buildDescription(params: {
  categoria: string;
  frequencia: string;
  horarios: string[];
  notificacoes: boolean;
}) {
  const { categoria, frequencia, horarios, notificacoes } = params;
  return `Categoria: ${categoria} | Frequência: ${frequencia} | Horários: ${horarios.join(
    ", "
  )} | Notificações: ${notificacoes ? "on" : "off"}`;
}

function showInfo(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
    return;
  }
  Alert.alert(title, message);
}

async function confirmDelete(): Promise<boolean> {
  if (Platform.OS === "web") {
    return window.confirm("Tem certeza que deseja excluir este hábito?");
  }
  return new Promise((resolve) => {
    Alert.alert(
      "Excluir Hábito",
      "Tem certeza que deseja excluir este hábito?",
      [
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        { text: "Excluir", style: "destructive", onPress: () => resolve(true) },
      ]
    );
  });
}

const EditHabitScreen: React.FC<Props> = ({ navigation, route }) => {
  const { habito } = route.params ?? {};
  const estaEditando = Boolean(habito);

  const [nome, setNome] = useState<string>(
    (habito?.name as string) ?? (habito as any)?.nome ?? ""
  );
  const [categoria, setCategoria] = useState<string>(
    (habito as any)?.categoria ?? "Saúde"
  );
  const [frequencia, setFrequencia] = useState<string>(
    (habito as any)?.frequencia ?? "Diário"
  );
  const [horarios, setHorarios] = useState<string[]>(
    Array.isArray((habito as any)?.horarios)
      ? ((habito as any).horarios as string[])
      : ["08:00"]
  );
  const [notificacoes, setNotificacoes] = useState<boolean>(
    typeof (habito as any)?.notificacoes === "boolean"
      ? Boolean((habito as any).notificacoes)
      : true
  );

  const onAdicionarHorario = () => setHorarios((prev) => [...prev, "08:00"]);

  const onRemoverHorario = (index: number) => {
    if (horarios.length <= 1) return;
    setHorarios((prev) => prev.filter((_, i) => i !== index));
  };

  const onAtualizarHorario = (index: number, valor: string) => {
    setHorarios((prev) => prev.map((h, i) => (i === index ? valor : h)));
  };

  const voltarParaLista = () =>
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "HabitosList" as never }],
      })
    );

  const onSalvar = async () => {
    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      showInfo("Erro", "Por favor, informe um nome para o hábito");
      return;
    }
    if (!estaEditando || !habito?.id) {
      showInfo("Erro", "Hábito inválido para edição");
      return;
    }

    try {
      const description = buildDescription({
        categoria,
        frequencia,
        horarios,
        notificacoes,
      });

      await api.put(`/habits/${habito.id}`, {
        name: nomeTrim,
        description,
      });

      Alert.alert("Sucesso", "Hábito atualizado com sucesso!", [
        { text: "OK", onPress: voltarParaLista },
      ]);
    } catch (e: unknown) {
      const err = e as any;
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        "Falha ao atualizar hábito";
      showInfo("Erro", String(msg));
    }
  };

  const onExcluir = async () => {
    if (!habito?.id) {
      showInfo("Erro", "Hábito inválido");
      return;
    }
    const ok = await confirmDelete();
    if (!ok) return;

    try {
      await api.delete(`/habits/${habito.id}`);
      showInfo("Sucesso", "Hábito excluído com sucesso!");
      voltarParaLista();
    } catch (e: unknown) {
      const err = e as any;
      const msg =
        err?.response?.data?.error ?? err?.message ?? "Falha ao excluir hábito";
      showInfo("Erro", String(msg));
    }
  };

  return (
    <View style={styles.container}>
      <Cabecalho
        titulo={estaEditando ? "Editar Hábito" : "Novo Hábito"}
        mostrarVoltar
        onVoltar={navigation.goBack}
      />

      <ScrollView style={styles.conteudo} keyboardShouldPersistTaps="handled">
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
            {CATEGORIAS.map((cat) => {
              const selecionada = categoria === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoriaItem,
                    selecionada && styles.categoriaSelecionada,
                  ]}
                  onPress={() => setCategoria(cat)}
                >
                  <Text
                    style={[
                      styles.categoriaTexto,
                      selecionada && styles.categoriaTextoSelecionado,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Frequência</Text>
          <View style={styles.frequenciasContainer}>
            {FREQUENCIAS.map((freq) => {
              const selecionada = frequencia === freq;
              return (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequenciaItem,
                    selecionada && styles.frequenciaSelecionada,
                  ]}
                  onPress={() => setFrequencia(freq)}
                >
                  <Text
                    style={[
                      styles.frequenciaTexto,
                      selecionada && styles.frequenciaTextoSelecionado,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.grupoFormulario}>
          <Text style={styles.rotulo}>Horários (Lembretes)</Text>
          {horarios.map((horario, index) => (
            <View key={`${horario}-${index}`} style={styles.horarioContainer}>
              <TextInput
                style={[styles.entrada, styles.horarioInput]}
                placeholder="HH:MM"
                placeholderTextColor={Cores.claro.textoSecundario}
                value={horario}
                onChangeText={(texto) => onAtualizarHorario(index, texto)}
              />
              <TouchableOpacity
                style={styles.botaoRemoverHorario}
                onPress={() => onRemoverHorario(index)}
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
            onPress={onAdicionarHorario}
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
            onPress={() => setNotificacoes((v) => !v)}
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

        <TouchableOpacity style={styles.botaoPrincipal} onPress={onSalvar}>
          <Text style={styles.textoBotaoPrincipal}>
            {estaEditando ? "Salvar Alterações" : "Salvar Hábito"}
          </Text>
        </TouchableOpacity>

        {estaEditando && (
          <TouchableOpacity style={styles.botaoExcluir} onPress={onExcluir}>
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
  categoriaSelecionada: {
    backgroundColor: Cores.claro.tonalidade,
    borderColor: Cores.claro.tonalidade,
  },
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
  horarioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  horarioInput: { flex: 1, marginRight: 8 },
  botaoRemoverHorario: { padding: 4 },
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
  notificacaoTexto: { color: Cores.claro.texto, fontSize: 16 },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    padding: 2,
    justifyContent: "center",
  },
  toggleAtivo: { backgroundColor: Cores.claro.tonalidade },
  togglePonto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },
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
  textoBotaoExcluir: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default EditHabitScreen;
