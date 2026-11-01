/**
 * Paletas do app. Mesma estrutura nos dois temas: cada tela pede a cor pelo
 * PAPEL que ela tem ("texto", "superfície", "perigo"), nunca pelo valor.
 *
 * Identidade: preto e papel + verde-limão elétrico, com violeta como segunda
 * cor viva. No escuro, o limão é o botão e o cartão principal. No claro, a
 * tinta preta assume o botão e o limão vira o brilho em cima dela.
 */
export type Esquema = "claro" | "escuro";

export type Paleta = {
  esquema: Esquema;

  // Fundos
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceRaised: string;
  input: string;
  border: string;
  borderSoft: string;

  // Texto
  text: string;
  textSecondary: string;
  textMuted: string;

  // Ação principal (botões, aba ativa, filtros marcados)
  primary: string;
  onPrimary: string;
  /** Texto de link e realces sobre o fundo da tela */
  primaryLight: string;
  primaryBackground: string;

  // Segunda cor viva (gráficos, detalhes)
  accent: string;

  // Preços e destaques quentes
  thread: string;
  threadSoft: string;
  threadBackground: string;

  // Estados
  success: string;
  danger: string;
  warning: string;
  successBackground: string;
  dangerBackground: string;
  warningBackground: string;

  // Cartão principal da tela inicial
  heroBg: string;
  heroText: string;
  heroTextSoft: string;
  heroTrack: string;
  heroLine: string;
  /** Cor de realce dentro do cartão principal */
  heroAccent: string;

  white: string;
  overlay: string;
  statusBar: "light" | "dark";
};

export const ESCURO: Paleta = {
  esquema: "escuro",

  background: "#0B0B0E",
  surface: "#16161B",
  surfaceSecondary: "#1F1F26",
  surfaceRaised: "#2A2A34",
  input: "#111116",
  border: "#363641",
  borderSoft: "#25252D",

  text: "#F6F6F1",
  textSecondary: "#C4C4CD",
  textMuted: "#8F8F9B",

  primary: "#C8FF2E",
  onPrimary: "#0B0B0E",
  primaryLight: "#D6FF6B",
  primaryBackground: "#232C0B",

  accent: "#9B86FF",

  thread: "#FFB020",
  threadSoft: "rgba(255, 176, 32, 0.4)",
  threadBackground: "#33260A",

  success: "#35E0A1",
  danger: "#FF5D52",
  warning: "#FFB020",
  successBackground: "#0F2F26",
  dangerBackground: "#3A1816",
  warningBackground: "#33260A",

  heroBg: "#C8FF2E",
  heroText: "#0B0B0E",
  heroTextSoft: "rgba(11, 11, 14, 0.66)",
  heroTrack: "rgba(11, 11, 14, 0.16)",
  heroLine: "rgba(11, 11, 14, 0.2)",
  heroAccent: "#0B0B0E",

  white: "#FFFFFF",
  overlay: "rgba(4, 4, 6, 0.74)",
  statusBar: "light",
};

export const CLARO: Paleta = {
  esquema: "claro",

  background: "#F3F0E8",
  surface: "#FFFFFF",
  surfaceSecondary: "#ECE8DD",
  surfaceRaised: "#E1DCCF",
  input: "#FFFFFF",
  border: "#CFC8B8",
  borderSoft: "#E3DED2",

  text: "#111114",
  textSecondary: "#41414B",
  textMuted: "#666670",

  primary: "#111114",
  onPrimary: "#C8FF2E",
  primaryLight: "#111114",
  primaryBackground: "#E6F8A8",

  accent: "#5B3DF5",

  thread: "#975000",
  threadSoft: "rgba(151, 80, 0, 0.4)",
  threadBackground: "#FFE9C7",

  success: "#07774F",
  danger: "#BF1F14",
  warning: "#975000",
  successBackground: "#D5F2E5",
  dangerBackground: "#FFDAD6",
  warningBackground: "#FFE9C7",

  heroBg: "#111114",
  heroText: "#F6F6F1",
  heroTextSoft: "rgba(246, 246, 241, 0.68)",
  heroTrack: "rgba(246, 246, 241, 0.18)",
  heroLine: "rgba(246, 246, 241, 0.2)",
  heroAccent: "#C8FF2E",

  white: "#FFFFFF",
  overlay: "rgba(17, 17, 20, 0.5)",
  statusBar: "dark",
};

export const PALETAS: Record<Esquema, Paleta> = {
  escuro: ESCURO,
  claro: CLARO,
};
