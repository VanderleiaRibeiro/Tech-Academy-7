import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import Cabecalho from "../../components/Cabecalho";
import { Cores } from "../../constants/Colors";
import api from "@/api/api";
import { useUser } from "@/telas/contexts/UserContext";

type UploadResponse = {
  success: boolean;
  message: string;
  file: {
    url: string;
    filename: string;
    originalName: string;
    userId: number | null;
  };
};

const UploadFotoScreen: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigation = useNavigation();

  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function escolherImagem() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à sua galeria para escolher a foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setImagemUri(asset.uri);
  }

  async function enviarImagem() {
    try {
      if (!user) {
        Alert.alert("Erro", "Usuário não autenticado.");
        return;
      }
      if (!imagemUri) {
        Alert.alert("Erro", "Escolha uma imagem primeiro.");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("image", {
        uri: imagemUri,
        name: "foto-perfil.jpg",
        type: "image/jpeg",
      } as any);

      const { data } = await api.post<UploadResponse>(
        "/auth/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!data.success) {
        Alert.alert("Erro", data.message || "Falha no upload.");
        return;
      }

      const baseUrl =
        (api.defaults.baseURL as string | undefined) ??
        process.env.EXPO_PUBLIC_API_URL ??
        "";

      const fullUrl = baseUrl ? `${baseUrl}${data.file.url}` : data.file.url;

      setUploadUrl(fullUrl);

      await updateUser({
        ...user,
        url_img: fullUrl,
      });

      Alert.alert("Sucesso", "Imagem enviada e salva no perfil!");
    } catch (e: any) {
      console.log("[UPLOAD ERR]", e?.response?.data || e?.message);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Falha ao enviar imagem";
      Alert.alert("Erro", String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Cabecalho
        titulo="Foto de Perfil"
        mostrarVoltar
        onVoltar={() => navigation.goBack()}
      />

      <View style={styles.container}>
        <Text style={styles.label}>
          Olá {user?.name || user?.email}, escolha uma foto:
        </Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={escolherImagem}
          activeOpacity={0.8}
        >
          {imagemUri ? (
            <Image source={{ uri: imagemUri }} style={styles.preview} />
          ) : user?.url_img ? (
            <Image source={{ uri: user.url_img }} style={styles.preview} />
          ) : (
            <View style={styles.previewVazio}>
              <Ionicons
                name="camera-outline"
                size={40}
                color={Cores.claro.textoSecundario}
              />
              <Text style={styles.previewTexto}>
                Toque para escolher uma foto
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, (!imagemUri || loading) && { opacity: 0.6 }]}
          onPress={enviarImagem}
          disabled={!imagemUri || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Enviar imagem</Text>
          )}
        </TouchableOpacity>

        {uploadUrl && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.resultadoTitulo}>Prévia da imagem salva:</Text>
            <Image
              source={{ uri: uploadUrl }}
              style={styles.previewResultado}
            />
            <Text style={styles.resultadoUrl}>{uploadUrl}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Cores.claro.fundo },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: Cores.claro.texto,
    marginBottom: 8,
  },
  seletor: {
    alignSelf: "center",
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Cores.claro.tonalidade,
    backgroundColor: "#fff",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  previewVazio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  previewTexto: {
    color: Cores.claro.textoSecundario,
    textAlign: "center",
  },
  botao: {
    backgroundColor: Cores.claro.tonalidade,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resultadoContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  resultadoTitulo: {
    fontSize: 16,
    fontWeight: "600",
    color: Cores.claro.texto,
    marginBottom: 8,
  },
  previewResultado: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 8,
  },
  resultadoUrl: {
    fontSize: 12,
    color: Cores.claro.textoSecundario,
    textAlign: "center",
  },
});

export default UploadFotoScreen;
