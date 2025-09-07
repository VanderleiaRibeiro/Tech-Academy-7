import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import Cabecalho from "../../components/Cabecalho";

function formatDatePTBR(date) {
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  const formatted = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${formatted}`;
}

export default function Home({ navigation }) {
  // Começa sem dados (estado "vazio")
  const [habits, setHabits] = useState([]);

  // carregue hábitos aqui
  const loadHabitos = useCallback(async () => {
    try {
      // (substitua a URL e o parse conforme o backend):
      // const res = await fetch("https://sua-api.com/habitos");
      // const data = await res.json();
      // setHabits(data);

      // Exemplo com AsyncStorage:
      // const raw = await AsyncStorage.getItem("@habitos");
      // setHabits(raw ? JSON.parse(raw) : []);

      // Por enquanto, nada: mantém vazio.
      setHabits([]);
    } catch (e) {
      console.log("Erro ao carregar hábitos:", e);
      setHabits([]);
    }
  }, []);

  useEffect(() => {
    loadHabitos();
  }, [loadHabitos]);

  const total = habits.length;
  const done = useMemo(
    () => habits.filter((h) => h.doneToday).length,
    [habits]
  );

  const toggle = useCallback((id) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, doneToday: !h.doneToday } : h))
    );
    // disparar um PATCH/PUT para marcar concluído.
  }, []);

  const goToHabitos = useCallback(() => {
    navigation?.navigate?.("Habitos");
  }, [navigation]);

  const renderItem = ({ item }) => (
    <View style={styles.habitCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.habitTitle}>{item.title}</Text>
        <Text style={styles.habitMeta}>
          {item.category} · {item.times?.[0] ?? "--:--"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => toggle(item.id)}
        style={[styles.check, item.doneToday && styles.checkOn]}
      >
        {item.doneToday ? (
          <Ionicons name="checkmark" size={18} color="#FFF" />
        ) : (
          <View style={styles.checkEmpty} />
        )}
      </TouchableOpacity>
    </View>
  );

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

        {/* Cabeçalho simples da Home */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Bom dia, Rodrigo 👋</Text>
            <Text style={styles.date}>{formatDatePTBR(new Date())}</Text>
          </View>
          <Ionicons name="settings-outline" size={22} color="#222" />
        </View>

        {/* Estado vazio */}
        {total === 0 ? (
          <>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCenterText}>0/0{"\n"}hábitos</Text>
            </View>

            <View style={styles.card}>
              <Ionicons
                name="cube-outline"
                size={64}
                color="#6C8FDB"
                style={{ marginBottom: 8, alignSelf: "center" }}
              />
              <Text style={styles.cardTitle}>Bem-vindo ao RVM Routine 🎉</Text>
              <Text style={styles.cardSubtitle}>
                Comece adicionando seu primeiro hábito para acompanhar sua
                rotina.
              </Text>

              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={goToHabitos}
              >
                <Text style={styles.buttonPrimaryText}>Cadastrar hábito</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Resumo do dia */}
            <View style={styles.summaryCard}>
              <View style={styles.fakeRing}>
                <Text style={styles.ringText}>
                  {done}/{total}
                  {"\n"}hábitos
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle}>
                  {done}/{total} hábitos concluídos
                </Text>
                <Text style={styles.summaryHint}>
                  {done === total
                    ? "Perfeito! Todos concluídos hoje."
                    : "Você está no caminho certo!"}
                </Text>
              </View>
            </View>

            {/* Lista de hábitos */}
            <FlatList
              data={habits}
              keyExtractor={(i) => i.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 24 }}
              scrollEnabled={false}
            />

            {/* Botão flutuante para cadastrar */}
            <TouchableOpacity style={styles.fab} onPress={goToHabitos}>
              <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
