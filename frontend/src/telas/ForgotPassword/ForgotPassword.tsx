import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "@/api/api";

type ForgotResp = { ok: true; devToken?: string };

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation<any>();

  async function handleSubmit() {
    const e = email.trim();
    if (!e || !e.includes("@")) {
      Alert.alert("Atenção", "Informe um e-mail válido");
      return;
    }
    try {
      const { data } = await api.post<ForgotResp>("/users/forgot-password", {
        email: e,
      });

      if (data?.devToken) {
        navigation.navigate("ResetPassword", { token: data.devToken });
      } else {
        Alert.alert(
          "Pronto",
          "Se o e-mail existir, você receberá instruções para redefinir sua senha."
        );
        navigation.navigate("Login");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Falha ao enviar";
      Alert.alert("Erro", msg);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", textAlign: "center" }}>
        Recuperar senha
      </Text>
      <TextInput
        placeholder="Seu e-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      <Button title="Enviar instruções" onPress={handleSubmit} />
    </View>
  );
}
