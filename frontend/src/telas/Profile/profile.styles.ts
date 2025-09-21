import { StyleSheet } from "react-native";
import { Cores } from "../../constants/Colors";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Cores.claro.fundo,
  },
  centerBox: { alignItems: "center", marginTop: 4, marginBottom: 16 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: "700", color: Cores.claro.texto },
  email: { marginTop: 2, fontSize: 13, color: Cores.claro.textoSecundario },
  list: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: Cores.claro.texto,
    fontWeight: "500",
  },
});
