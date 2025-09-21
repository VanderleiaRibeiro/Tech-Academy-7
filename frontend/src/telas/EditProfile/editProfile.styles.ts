import { StyleSheet } from "react-native";
import { Cores } from "../../constants/Colors";

export const editStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Cores.claro.fundo,
  },
  helper: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 12,
    fontSize: 13,
  },
  inputWrapper: { marginBottom: 14, width: "100%" },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Cores.claro.texto,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#111",
  },
  button: {
    width: "100%",
    backgroundColor: Cores.claro.tonalidade,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteButton: {
    width: "100%",
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
