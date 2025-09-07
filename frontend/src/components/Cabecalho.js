import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Cabecalho() {
  return (
    <View style={estilo.cabecalho}>
      <Text style={estilo.titulo}>RVM Routine</Text>
    </View>
  );
}

const estilo = StyleSheet.create({
  cabecalho: {
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
});
