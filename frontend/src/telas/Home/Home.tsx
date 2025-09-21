// src/telas/Home/Home.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cores } from "../../constants/Colors";
import Cabecalho from "../../components/Cabecalho";
import api from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TAB_HABITOS } from "@/navigation/MainTabs";
import Svg, { Circle } from "react-native-svg";
import { styles } from "./styles";

type HabitDTO = { id: number; name: string; description: string | null };

const STORAGE_KEY = (dateISO: string) => `rvm:done:${dateISO}`;

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type ProgressRingProps = {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
};

const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  total,
  size = 92,
  stroke = 8,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  const dashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Cores.claro.tonalidade}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringNumber}>
          {value}/{total}
        </Text>
        <Text style={styles.ringLabel}>hábitos</Text>
      </View>
    </View>
  );
};

export default function Home() {
  const navigation = useNavigation<any>();
  const [habitos, setHabitos] = useState<HabitDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});
  const dateKey = todayISO();

  const carregarHabitos = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await api.get<HabitDTO[]>("/habits");
      setHabitos(data);
    } catch (e) {
      console.log("Erro ao carregar hábitos", e);
      setHabitos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarConcluidos = useCallback(async (): Promise<void> => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY(dateKey));
    if (!raw) {
      setDoneMap({});
      return;
    }
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    const converted: Record<number, boolean> = {};
    Object.keys(parsed).forEach((k) => {
      converted[Number(k)] = parsed[k];
    });
    setDoneMap(converted);
  }, [dateKey]);

  useEffect(() => {
    carregarHabitos();
    carregarConcluidos();
  }, [carregarHabitos, carregarConcluidos]);

  useFocusEffect(
    useCallback(() => {
      carregarHabitos();
      carregarConcluidos();
    }, [carregarHabitos, carregarConcluidos])
  );

  const toggleDone = useCallback(
    async (id: number): Promise<void> => {
      const next: Record<number, boolean> = { ...doneMap, [id]: !doneMap[id] };
      setDoneMap(next);
      const toStore: Record<string, boolean> = {};
      Object.keys(next).forEach((k) => {
        toStore[k] = next[Number(k)];
      });
      await AsyncStorage.setItem(STORAGE_KEY(dateKey), JSON.stringify(toStore));
    },
    [doneMap, dateKey]
  );

  const total = habitos.length;
  const concluidos = useMemo(
    () => habitos.filter((h) => !!doneMap[h.id]).length,
    [habitos, doneMap]
  );

  const irCadastrarHabito = (): void => {
    navigation.navigate(TAB_HABITOS, { screen: "CadastrarHabito" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Cores.claro.fundo }}>
      {/* Header fixo com área segura */}
      <Cabecalho titulo="RVM Routine" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bom dia, Rodrigo 👋</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
          })}
        </Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} />
        ) : total === 0 ? (
          <>
            <Text style={styles.subtitle}>
              Comece adicionando seu primeiro hábito
            </Text>
            <View style={styles.card}>
              <Ionicons
                name="cube-outline"
                size={48}
                color={Cores.claro.tonalidade}
              />
              <Text style={styles.cardTitle}>Bem-vindo ao RVM Routine 🎉</Text>
              <Text style={styles.cardSubtitle}>
                Comece adicionando seu primeiro hábito para acompanhar sua
                rotina.
              </Text>
              <TouchableOpacity style={styles.cta} onPress={irCadastrarHabito}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.ctaText}>Cadastrar hábito</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Bloco de progresso */}
            <View style={styles.progressCard}>
              <ProgressRing value={concluidos} total={total} />
              <View style={styles.progressSide}>
                <Text style={styles.progressTitle}>
                  {concluidos}/{total} hábitos
                </Text>
                <Text style={styles.progressSubtitle}>concluídos</Text>
                <Text style={styles.progressHint}>
                  Você está no caminho certo!
                </Text>
              </View>
            </View>

            {/* Lista de hábitos — agora TODOS (sem slice) */}
            {habitos.map((h) => {
              const checked = !!doneMap[h.id];
              return (
                <View key={h.id} style={styles.habitRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.habitName}>{h.name}</Text>
                    {!!h.description && (
                      <Text style={styles.habitMeta} numberOfLines={1}>
                        {h.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.checkbox, checked && styles.checkboxChecked]}
                    onPress={() => toggleDone(h.id)}
                  >
                    {checked && (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.fab, { alignSelf: "flex-end" }]}
              onPress={irCadastrarHabito}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
