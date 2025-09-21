import api from "@/api/api";

export async function requestPasswordReset(email: string) {
  await api.post("/users/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
  await api.post("/users/reset-password", { token, password });
}
