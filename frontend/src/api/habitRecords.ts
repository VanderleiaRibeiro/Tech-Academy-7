import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/api/api";

function isoToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function getCurrentUserId(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem("@user");
    if (!raw) return "anon";
    const parsed = JSON.parse(raw);
    return String(parsed?.id ?? "anon");
  } catch {
    return "anon";
  }
}

function cacheKey(habitId: number, userId: string, date = isoToday()) {
  return `@habitrec:${userId}:${habitId}:${date}`;
}

type CachedRecord = { completed: boolean; ts: number };

export async function getTodayRecord(habitId: number) {
  const date = isoToday();
  const uid = await getCurrentUserId();
  const key = cacheKey(habitId, uid, date);

  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as CachedRecord;
      return { completed: !!parsed.completed, ts: parsed.ts };
    } catch {}
  }

  const { data } = await api.get(`/habits/${habitId}/records`, {
    params: { date },
  });

  const record =
    Array.isArray(data) && data.length
      ? { completed: !!data[0]?.completed, ts: Date.now() }
      : null;

  if (record) {
    await AsyncStorage.setItem(
      key,
      JSON.stringify({ completed: record.completed, ts: record.ts })
    );
  } else {
    await AsyncStorage.removeItem(key);
  }

  return record;
}

export async function setTodayRecord(habitId: number, completed = true) {
  const date = isoToday();
  const uid = await getCurrentUserId();
  const key = cacheKey(habitId, uid, date);

  const { data } = await api.post(`/habits/${habitId}/records`, {
    date,
    completed,
  });

  await AsyncStorage.setItem(
    key,
    JSON.stringify({ completed: true, ts: Date.now() })
  );

  return data;
}
export async function clearTodayRecord(habitId: number) {
  const date = isoToday();
  const uid = await getCurrentUserId();
  const key = cacheKey(habitId, uid, date);

  const { data } = await api.delete(`/habits/${habitId}/records`, {
    params: { date },
  });

  await AsyncStorage.removeItem(key);

  return data;
}
