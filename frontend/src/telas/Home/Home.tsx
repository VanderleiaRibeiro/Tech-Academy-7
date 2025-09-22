import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Cores } from "../../constants/Colors";
import Cabecalho from "../../components/Cabecalho";
import api from "@/api/api";
import { TAB_HABITOS } from "@/navigation/MainTabs";
import Svg, { Circle } from "react-native-svg";
import { styles } from "./styles";
import {
  getTodayRecord,
  setTodayRecord,
  clearTodayRecord,
} from "@/api/habitRecords";
import { useUser } from "@/telas/contexts/UserContext";

type HabitDTO = { id: number; name: string; description: string | null };

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

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function firstName(full?: string | null) {
  const t = (full ?? "").trim();
  if (!t) return "";
  const base = t.includes("@") ? t.split("@")[0] : t.split(/\s+/)[0];
  return capitalize(base);
}

export default function Home() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const [habitos, setHabitos] = useState<HabitDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [doneMap, setDoneMap] = useState<Record<number, boolean>>({});
  const [syncing, setSyncing] = useState<number | null>(null);

  const [mostrarConcluidos, setMostrarConcluidos] = useState(true);

  const displayName = firstName(user?.name) || firstName(user?.email);
  const saudacao = `Olá${displayName ? `, ${displayName}` : ""}`;

  const carregarHabitos = useCallback(async (): Promise<HabitDTO[]> => {
    try {
      setLoading(true);
      const { data } = await api.get<HabitDTO[]>("/habits");
      setHabitos(data);
      return data;
    } catch (e) {
      console.log("Erro ao carregar hábitos", e);
      setHabitos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarConcluidosHoje = useCallback(
    async (lista: HabitDTO[]): Promise<void> => {
      try {
        const entries = await Promise.all(
          lista.map(async (h) => {
            try {
              const rec = await getTodayRecord(h.id);
              return [h.id, !!rec?.completed] as const;
            } catch {
              return [h.id, false] as const;
            }
          })
        );
        const next: Record<number, boolean> = {};
        entries.forEach(([id, val]) => (next[id] = val));
        setDoneMap(next);
      } catch (e) {
        console.log("Erro ao carregar concluídos do dia", e);
        setDoneMap({});
      }
    },
    []
  );

  useEffect(() => {
    (async () => {
      const lista = await carregarHabitos();
      await carregarConcluidosHoje(lista);
    })();
  }, [carregarHabitos, carregarConcluidosHoje]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const lista = await carregarHabitos();
        if (!active) return;
        await carregarConcluidosHoje(lista);
      })();
      return () => {
        active = false;
      };
    }, [carregarHabitos, carregarConcluidosHoje])
  );

  const toggleDone = useCallback(
    async (id: number): Promise<void> => {
      if (syncing !== null) return;
      const currentlyDone = !!doneMap[id];

      setDoneMap((prev) => ({ ...prev, [id]: !currentlyDone }));
      setSyncing(id);

      try {
        if (currentlyDone) {
          await clearTodayRecord(id);
        } else {
          await setTodayRecord(id, true);
        }
      } catch {
        setDoneMap((prev) => ({ ...prev, [id]: currentlyDone }));
        Alert.alert("Ops", "Não foi possível atualizar este hábito agora.");
      } finally {
        setSyncing(null);
      }
    },
    [doneMap, syncing]
  );

  const total = habitos.length;
  const concluidos = useMemo(
    () => habitos.filter((h) => !!doneMap[h.id]).length,
    [habitos, doneMap]
  );

  const pendentesHoje = useMemo(
    () => habitos.filter((h) => !doneMap[h.id]),
    [habitos, doneMap]
  );
  const concluidosHoje = useMemo(
    () => habitos.filter((h) => !!doneMap[h.id]),
    [habitos, doneMap]
  );

  const irCadastrarHabito = (): void => {
    navigation.navigate(TAB_HABITOS, { screen: "CadastrarHabito" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Cores.claro.fundo }}>
      <Cabecalho titulo="RVM Routine" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{saudacao}</Text>
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
            <View style={styles.card}>
              <Ionicons
                name="cube-outline"
                size={48}
                color={Cores.claro.tonalidade}
              />
              <Text style={styles.cardTitle}>Bem-vindo ao RVM Routine</Text>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>A fazer</Text>
              {pendentesHoje.length === 0 && (
                <Text style={styles.sectionSmall}>Tudo certo por aqui</Text>
              )}
            </View>

            {pendentesHoje.map((h) => {
              const checked = !!doneMap[h.id];
              const isSyncing = syncing === h.id;
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
                    style={[
                      styles.checkbox,
                      checked && styles.checkboxChecked,
                      isSyncing && { opacity: 0.6 },
                    ]}
                    onPress={() => toggleDone(h.id)}
                    disabled={isSyncing}
                    activeOpacity={0.85}
                  >
                    {checked ? (
                      <Ionicons name="checkmark" size={18} color="#fff" />
                    ) : (
                      <Ionicons
                        name="square-outline"
                        size={18}
                        color="#64748B"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            {concluidosHoje.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Concluídos hoje</Text>
                  <TouchableOpacity
                    onPress={() => setMostrarConcluidos((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sectionToggle}>
                      {mostrarConcluidos ? "Ocultar" : "Mostrar"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {mostrarConcluidos &&
                  concluidosHoje.map((h) => {
                    const checked = !!doneMap[h.id];
                    const isSyncing = syncing === h.id;

                    return (
                      <View
                        key={h.id}
                        style={[styles.habitRow, styles.habitRowDone]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[styles.habitName, styles.habitNameDone]}
                          >
                            {h.name}
                          </Text>
                          {!!h.description && (
                            <Text
                              style={[styles.habitMeta, styles.habitMetaDone]}
                              numberOfLines={1}
                            >
                              {h.description}
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            checked && styles.checkboxChecked,
                            isSyncing && { opacity: 0.6 },
                          ]}
                          onPress={() => toggleDone(h.id)}
                          disabled={isSyncing}
                          activeOpacity={0.85}
                        >
                          {checked ? (
                            <Ionicons name="checkmark" size={18} color="#fff" />
                          ) : (
                            <Ionicons
                              name="square-outline"
                              size={18}
                              color="#64748B"
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
              </>
            )}

            <TouchableOpacity
              style={styles.fab}
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
