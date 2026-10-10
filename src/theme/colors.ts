/**
 * Paleta "jeans com costura".
 *
 * Base em azul denim escuro, com o âmbar da costura aparente do jeans
 * como cor de destaque (usada com parcimônia: pontos de costura,
 * avisos e preços). Os nomes antigos foram mantidos para não quebrar
 * nenhum arquivo que ainda use COLORS.
 */
export const COLORS = {
  // Fundos
  background: "#0A1020",
  surface: "#111A2E",
  surfaceSecondary: "#18233D",
  surfaceRaised: "#1E2B49",
  input: "#0D1526",
  border: "#25324F",
  borderSoft: "#1A2640",

  // Texto
  text: "#F4F6FD",
  textSecondary: "#B4BDD6",
  textMuted: "#7D89A8",

  // Marca
  primary: "#4F7BFF",
  primaryLight: "#8FAAFF",
  primaryBackground: "#182650",

  // Costura (destaque)
  thread: "#F5B544",
  threadSoft: "rgba(245, 181, 68, 0.38)",
  threadBackground: "#2E2614",

  // Estados
  success: "#3FDCA6",
  danger: "#FF6B7C",
  warning: "#F5B544",

  successBackground: "#10302B",
  dangerBackground: "#33182A",
  warningBackground: "#2E2614",

  white: "#FFFFFF",
  overlay: "rgba(4, 7, 15, 0.72)",
} as const;
