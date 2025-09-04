import { StyleSheet } from "react-native";

export const signupStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },

  logo: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },

  inputWrapper: {
    width: "100%",
    marginBottom: 15,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 0,
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
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  link: {
    color: "#4DA6FF",
    textAlign: "center",
    fontSize: 14,
    marginTop: 10,
  },
});
