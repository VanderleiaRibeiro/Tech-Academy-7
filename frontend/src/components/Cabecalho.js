import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Cabecalho() {
  return (
    <View style={estilo.header}>
      <Text style={estilo.title}>RVM routine</Text>
      <TouchableOpacity>
        <Text style={{ color: "blue" }}>Menu</Text>
      </TouchableOpacity>
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
