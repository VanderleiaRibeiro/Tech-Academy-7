import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signupStyles as styles } from "../Signup/styles";
import api from "@/api/api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignupScreen({ navigation }: Props) {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [confirmarSenha, setConfirmarSenha] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState<boolean>(false);

  const handleSignup = async () => {
    try {
      console.log("[SIGNUP] start");

      if (!email || !senha) {
        Alert.alert("Atenção", "Preencha e-mail e senha.");
        return;
      }
      if (senha !== confirmarSenha) {
        Alert.alert("Atenção", "As senhas não coincidem.");
        return;
      }

      const senhaOk =
        senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /\d/.test(senha) &&
        /[@$!%*?&]/.test(senha);
      if (!senhaOk) {
        Alert.alert(
          "Senha fraca",
          "Use pelo menos 8 caracteres, 1 letra maiúscula, 1 número e 1 símbolo."
        );
        return;
      }

      const r = await api.post("/users/register", {
        name: nome || null,
        email: email.trim().toLowerCase(),
        password: senha,
      });

      console.log("[SIGNUP OK]", r.status, r.data);
      Alert.alert("Sucesso", "Cadastro realizado!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (e: any) {
      const status = e?.response?.status;
      const apiMsg = e?.response?.data?.message;
      const msg =
        apiMsg ??
        (status === 409
          ? "E-mail já cadastrado."
          : e?.message ?? "Erro no cadastro. Tente novamente.");
      Alert.alert("Erro", msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.logo}>RVM Routine</Text>
          <Text style={styles.title}>Cadastro</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Digite sua senha"
                secureTextEntry={!mostrarSenha}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <Ionicons
                  name={mostrarSenha ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Confirme sua senha"
                secureTextEntry={!mostrarConfirmarSenha}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              >
                <Ionicons
                  name={mostrarConfirmarSenha ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu CPF"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>
              Já tem uma conta?{" "}
              <Text style={{ fontWeight: "bold" }}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
