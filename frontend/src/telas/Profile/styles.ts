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
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F1B2D",
  },

  centerBox: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E5E7EB",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F1B2D",
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  list: {
    marginTop: 6,
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  rowText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
});
