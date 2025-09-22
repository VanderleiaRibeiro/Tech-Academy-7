import { StyleSheet } from "react-native";
import { Cores } from "../../constants/Colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.claro.fundo },

  content: { padding: 16, paddingTop: 20, paddingBottom: 88, flexGrow: 1 },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Cores.claro.texto,
    marginTop: 8,
    marginBottom: 6,
  },
  dateText: {
    color: Cores.claro.textoSecundario,
    marginBottom: 12,
    textTransform: "capitalize",
  },
  subtitle: {
    fontSize: 14,
    color: Cores.claro.textoSecundario,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Cores.claro.texto,
  },
  sectionSmall: {
    fontSize: 12,
    color: Cores.claro.textoSecundario,
  },
  sectionToggle: {
    fontSize: 13,
    fontWeight: "600",
    color: Cores.claro.tonalidade,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Cores.claro.texto,
    marginTop: 12,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Cores.claro.textoSecundario,
    textAlign: "center",
    marginTop: 6,
  },
  cta: {
    marginTop: 16,
    backgroundColor: Cores.claro.tonalidade,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "700", marginLeft: 8, fontSize: 15 },

  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  progressSide: { marginLeft: 12, flex: 1 },

  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ringNumber: { fontSize: 16, fontWeight: "700", color: Cores.claro.texto },
  ringLabel: {
    fontSize: 11,
    color: Cores.claro.textoSecundario,
    marginTop: -2,
  },
  progressTitle: { fontSize: 17, fontWeight: "700", color: Cores.claro.texto },
  progressSubtitle: { fontSize: 14, color: Cores.claro.texto, marginTop: -2 },
  progressHint: {
    fontSize: 12,
    color: Cores.claro.textoSecundario,
    marginTop: 4,
  },

  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  habitName: { fontSize: 16, fontWeight: "600", color: Cores.claro.texto },
  habitMeta: { fontSize: 13, color: Cores.claro.textoSecundario, marginTop: 2 },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxChecked: { backgroundColor: "#22C55E", borderColor: "#22C55E" },

  habitRowDone: {
    opacity: 0.9,
    backgroundColor: "#F8FAFC",
  },
  habitNameDone: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  habitMetaDone: {
    color: "#9CA3AF",
  },

  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Cores.claro.tonalidade,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 16,
    bottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
