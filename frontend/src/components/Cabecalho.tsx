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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Cores } from "../constants/Colors";

type Props = {
  titulo?: string;
  subtitle?: string;
  mostrarVoltar?: boolean;
  onVoltar?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
};

const Cabecalho: React.FC<Props> = ({
  titulo,
  subtitle,
  mostrarVoltar = false,
  onVoltar,
  rightIcon,
  onRightPress,
  containerStyle,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ backgroundColor: Cores.claro.fundo }}>
      <View
        style={[
          styles.wrapper,
          { paddingTop: insets.top > 0 ? 6 : 0 },
          containerStyle,
        ]}
      >
        {/* esquerda */}
        {mostrarVoltar ? (
          <TouchableOpacity
            onPress={onVoltar}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.sideBtn}
          >
            <Ionicons name="chevron-back" size={22} color={Cores.claro.texto} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideBtn} />
        )}

        {/* centro absoluto (garante que nunca “some”) */}
        <View pointerEvents="none" style={styles.centerAbsolute}>
          {titulo ? (
            <Text style={[styles.title, titleStyle]}>{titulo}</Text>
          ) : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {/* direita */}
        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.sideBtn}
          >
            <Ionicons name={rightIcon} size={22} color={Cores.claro.texto} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideBtn} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    minHeight: 44,
    justifyContent: "center",
  },
  sideBtn: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  centerAbsolute: {
    position: "absolute",
    left: 56, // dá espaço pra seta
    right: 56, // dá espaço pra ação da direita
    top: 0,
    bottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: Cores.claro.texto },
  subtitle: {
    fontSize: 12,
    color: Cores.claro.textoSecundario,
    marginTop: 2,
    textAlign: "center",
  },
});

export default Cabecalho;
