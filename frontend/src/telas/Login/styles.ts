import { StyleSheet } from "react-native";
import { Cores } from "../../constants/Colors"; // 👈 adicionado

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingHorizontal: 30,
    paddingBottom: 24,
    backgroundColor: Cores.claro.fundo, // 👈 agora usa fundo padrão cinza claro
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  inputWrapper: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 14.9,
    alignSelf: "center",
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff", // 👈 inputs continuam brancos
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: "#fff", // 👈 campo de senha também branco
  },

  inputPassword: {
    flex: 1,
    paddingVertical: 12,
  },

  button: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    alignSelf: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  linksContainer: {
    alignItems: "center",
  },

  linkText: {
    color: "#4DA6FF",
    fontSize: 14,
    marginTop: 5,
  },
});
