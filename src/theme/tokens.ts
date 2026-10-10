import { Platform, TextStyle, ViewStyle } from "react-native";
import { COLORS } from "./colors";

/** Espaçamentos (múltiplos de 4) */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  huge: 40,
} as const;

/** Raios: quanto maior o elemento, maior o raio */
export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
} as const;

/** Margem lateral padrão das telas */
export const GUTTER = 20;

/** Escala tipográfica */
export const TYPE = {
  display: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1.4,
    fontVariant: ["tabular-nums"],
  } as TextStyle,

  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: COLORS.text,
  } as TextStyle,

  heading: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: COLORS.text,
  } as TextStyle,

  bodyStrong: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: COLORS.text,
  } as TextStyle,

  body: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.textSecondary,
  } as TextStyle,

  caption: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
  } as TextStyle,

  small: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  } as TextStyle,

  number: {
    fontVariant: ["tabular-nums"],
  } as TextStyle,
} as const;

/** Sombra de brilho para botões principais */
export const GLOW: ViewStyle = Platform.select({
  ios: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  default: {
    elevation: 8,
    shadowColor: COLORS.primary,
  },
}) as ViewStyle;

/** Sombra suave para elementos flutuantes (abas, toast) */
export const LIFT: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  default: {
    elevation: 14,
    shadowColor: "#000",
  },
}) as ViewStyle;
