// Cabecalho.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CabecalhoProps = {
  titulo?: string;
  mostrarVoltar?: boolean;
  onVoltar?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

const Cabecalho: React.FC<CabecalhoProps> = ({
  titulo = "RVM Routine",
  mostrarVoltar = false,
  onVoltar,
  containerStyle,
  titleStyle,
}) => {
  return (
    <View style={[estilo.cabecalho, containerStyle]}>
      {mostrarVoltar ? (
        <TouchableOpacity
          onPress={onVoltar}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={estilo.voltarBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
      ) : (
        <View style={estilo.voltarBtnPlaceholder} />
      )}

      <Text style={[estilo.titulo, titleStyle]}>{titulo}</Text>

      {/* Placeholder pra manter o título centralizado */}
      <View style={estilo.voltarBtnPlaceholder} />
    </View>
  );
};

export default Cabecalho;

const estilo = StyleSheet.create({
  cabecalho: {
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  voltarBtn: {
    padding: 4,
  },
  voltarBtnPlaceholder: {
    width: 26,
    height: 26,
  },
});
