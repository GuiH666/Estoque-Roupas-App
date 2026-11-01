import { Platform, TextStyle, ViewStyle } from "react-native";

import { COLORS } from "./colors";
import type { Esquema } from "./paletas";
import { esquemaAtual } from "./tema";
import { viva } from "./viva";

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

/** Raios: grandes, para um visual de cartões generosos */
export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  pill: 999,
} as const;

/** Margem lateral padrão das telas */
export const GUTTER = 20;

type Tipos = {
  display: TextStyle;
  title: TextStyle;
  heading: TextStyle;
  bodyStrong: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  small: TextStyle;
  number: TextStyle;
};

function construirTipos(): Tipos {
  return {
    display: {
      fontSize: 46,
      fontWeight: "900",
      letterSpacing: -2,
      fontVariant: ["tabular-nums"],
    },

    title: {
      fontSize: 36,
      fontWeight: "900",
      letterSpacing: -1.4,
      color: COLORS.text,
    },

    heading: {
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.6,
      color: COLORS.text,
    },

    bodyStrong: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.2,
      color: COLORS.text,
    },

    body: {
      fontSize: 15,
      fontWeight: "500",
      color: COLORS.textSecondary,
    },

    caption: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.textMuted,
    },

    small: {
      fontSize: 12,
      fontWeight: "700",
      color: COLORS.textMuted,
    },

    number: {
      fontVariant: ["tabular-nums"],
    },
  };
}

/* Um conjunto de estilos por tema, montado só na primeira vez que é usado */
const tiposPorTema: Partial<Record<Esquema, Tipos>> = {};

/** Escala tipográfica (as cores de texto acompanham o tema) */
export const TYPE: Tipos = viva(() => {
  const esquema = esquemaAtual();
  return (tiposPorTema[esquema] ??= construirTipos());
});

function construirBrilho(): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    default: {
      elevation: 8,
      shadowColor: COLORS.primary,
    },
  }) as ViewStyle;
}

function construirSombra(): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
    },
    default: {
      elevation: 14,
      shadowColor: "#000",
    },
  }) as ViewStyle;
}

const brilhoPorTema: Partial<Record<Esquema, ViewStyle>> = {};
const sombraPorTema: Partial<Record<Esquema, ViewStyle>> = {};

/** Brilho colorido dos botões principais (use: style={[estilo, glow()]}) */
export function glow(): ViewStyle {
  return (brilhoPorTema[esquemaAtual()] ??= construirBrilho());
}

/** Sombra suave dos elementos flutuantes (use: style={[estilo, lift()]}) */
export function lift(): ViewStyle {
  return (sombraPorTema[esquemaAtual()] ??= construirSombra());
}
