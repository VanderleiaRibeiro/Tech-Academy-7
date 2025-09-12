import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { styles } from "./styles";
import Cabecalho from "../../components/Cabecalho";
import api from "@/api/api";
import { useUser } from "@/telas/contexts/UserContext";

type HabitUI = {
  id: string;
  title: string;
  category: string;
  times?: string[];
  doneToday: boolean;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const extract = (str: string | null | undefined, re: RegExp, fallback = "—") => {
  if (!str) return fallback;
  const m = str.match(re);
  return (m?.[1] || fallback).trim();
};

export default function Home() {
  const [habits, setHabits] = useState<HabitUI[]>([]);
  const { user } = useUser(); // usa o MESMO contexto do App.tsx

  const displayName = useMemo(() => {
  const byName = (user?.name || "").trim();
  if (byName) return byName;
  if (user?.email) return user.email.split("@")[0];
  return "você";
}, [user?.name, user?.email]);

  const loadHabits = useCallback(async () => {
    try {
      if (!user) return;

      // GET /habits autenticado (middleware usa o usuário do token)
      const { data } = await api.get("/habits");

      const tdy = todayISO();
      const mapped: HabitUI[] = (Array.isArray(data) ? data : []).map((h: any) => {
        const desc = h?.description ?? null;
        // quando incluído pelo Sequelize, normalmente vem como HabitRecords
        const records: any[] = h?.HabitRecords || h?.habit_records || [];

        const doneToday = records.some((r: any) => {
          const d = String(r?.date ?? "");
          const status = String(r?.status ?? "").toLowerCase();
          const completed = Boolean(r?.completed);
          return d === tdy && (completed || !status || status === "done");
        });

        return {
          id: String(h.id),
          title: h.name ?? "Hábito",
          category: extract(desc, /Categoria:\s*([^|]+)/),
          times: extract(desc, /Horários:\s*([^|]+)/, "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          doneToday,
        };
      });

      setHabits(mapped);
    } catch (err) {
      console.error("Erro ao carregar hábitos:", err);
      setHabits([]);
    }
  }, [user]);

  // refetch sempre que a aba Home volta a ficar em foco
  useFocusEffect(useCallback(() => { loadHabits(); }, [loadHabits]));

  const total = habits.length;
  const done = useMemo(() => habits.filter((h) => h.doneToday).length, [habits]);

  const toggle = useCallback((id: string) => {
    // (opcional) aqui você pode chamar POST /habits/:id/records { date: todayISO() }
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, doneToday: !h.doneToday } : h)));
  }, []);

  const renderItem: ListRenderItem<HabitUI> = ({ item }) => (
    <View style={styles.habitCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.habitTitle}>{item.title}</Text>
        <Text style={styles.habitMeta}>
          {item.category} · {item.times?.[0] ?? "--:--"}
        </Text>
      </View>
      <TouchableOpacity onPress={() => toggle(item.id)} style={[styles.check, item.doneToday && styles.checkOn]}>
        {item.doneToday ? <Ionicons name="checkmark" size={18} color="#FFF" /> : <View style={styles.checkEmpty} />}
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Cabecalho />

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Bom dia, {displayName} 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </Text>
          </View>
          <Ionicons name="settings-outline" size={22} color="#222" />
        </View>

        {/* Estado vazio x lista */}
        {total === 0 ? (
          <>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCenterText}>0/0{"\n"}hábitos</Text>
            </View>

            <View style={styles.card}>
              <Ionicons name="cube-outline" size={64} color="#6C8FDB" style={{ marginBottom: 8, alignSelf: "center" }} />
              <Text style={styles.cardTitle}>Bem-vindo ao RVM Routine 🎉</Text>
              <Text style={styles.cardSubtitle}>Comece adicionando seu primeiro hábito para acompanhar sua rotina.</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.fakeRing}>
                <Text style={styles.ringText}>
                  {done}/{total}
                  {"\n"}hábitos
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle}>{done}/{total} hábitos concluídos</Text>
                <Text style={styles.summaryHint}>{done === total ? "Perfeito! Todos concluídos hoje." : "Você está no caminho certo!"}</Text>
              </View>
            </View>

            <FlatList
              data={habits}
              keyExtractor={(i) => i.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 24 }}
              scrollEnabled={false}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
