import api from "@/api/api";

function isoToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function getTodayRecord(habitId: number) {
  const { data } = await api.get(`/habits/${habitId}/records`, {
    params: { date: isoToday() },
  });
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function setTodayRecord(habitId: number, completed = true) {
  const { data } = await api.post(`/habits/${habitId}/records`, {
    date: isoToday(),
    completed,
  });
  return data;
}

export async function clearTodayRecord(habitId: number) {
  const { data } = await api.delete(`/habits/${habitId}/records`, {
    params: { date: isoToday() },
  });
  return data;
}
