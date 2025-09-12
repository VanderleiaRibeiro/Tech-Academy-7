// constants/Colors.ts
const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export type ThemeMode = "light" | "dark";
export interface ThemeColors {
  text: string;
  background: string;
  primary: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export const Colors: Record<ThemeMode, ThemeColors> = {
  light: {
    text: "#11181C",
    background: "#fff",
    primary: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    primary: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

// ---- Alias compatível com o código antigo (Cores.claro.*) ----
type Paleta = {
  texto: string;
  textoSecundario: string;
  fundo: string;
  tonalidade: string;
  borda: string;
  perigo: string;
};

export const Cores: Record<"claro" | "escuro", Paleta> = {
  claro: {
    texto: "#0F1B2D",
    textoSecundario: "#6B7280",
    fundo: "#F8FAFF",
    tonalidade: "#007AFF",
    borda: "#E5E7EB",
    perigo: "#EF4444",
  },
  escuro: {
    texto: "#ECEDEE",
    textoSecundario: "#9BA1A6",
    fundo: "#151718",
    tonalidade: "#60A5FA",
    borda: "#2D2F31",
    perigo: "#F87171",
  },
} as const;
