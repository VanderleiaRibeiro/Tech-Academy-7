import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFF",
  },

  header: {
    width: "100%",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hello: { fontSize: 22, fontWeight: "700", color: "#0F1B2D" },
  date: { marginTop: 2, fontSize: 14, color: "#6B7280" },

  // Estado vazio
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    borderWidth: 8,
    borderColor: "#DDE7FF",
    marginVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCenterText: {
    textAlign: "center",
    color: "#334155",
    fontWeight: "600",
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F1B2D",
    marginBottom: 6,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginBottom: 16,
  },

  buttonPrimary: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Resumo
  summaryCard: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
    marginBottom: 12,
  },
  fakeRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 8,
    borderColor: "#DDE7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderLeftColor: "#5B8CFF",
    borderBottomColor: "#5B8CFF",
    transform: [{ rotate: "45deg" }],
  },
  ringText: {
    transform: [{ rotate: "-45deg" }],
    textAlign: "center",
    fontSize: 12,
    color: "#1F2937",
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  summaryHint: { fontSize: 13, color: "#6B7280", marginTop: 4 },

  // Lista
  habitCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  habitTitle: { fontSize: 16, fontWeight: "700", color: "#0F1B2D" },
  habitMeta: { marginTop: 4, fontSize: 12, color: "#6B7280" },

  check: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  checkOn: { backgroundColor: "#34C759" },
  checkEmpty: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: "#9CA3AF",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
