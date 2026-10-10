import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PressableScale from "./PressableScale";
import { COLORS } from "../../theme/colors";
import { haptics } from "../../utils/haptics";

type Props = {
  rotulo: string;
  ativo?: boolean;
  onPress: () => void;
  icone?: keyof typeof Ionicons.glyphMap;
  /** Número pequeno ao lado do texto (ex.: quantidade de itens) */
  contagem?: number;
  /** Cor do chip quando ativo (padrão: azul da marca) */
  tom?: string;
  /** Cor do texto quando ativo (padrão: branco) */
  tomTexto?: string;
  /** Bolinha de cor antes do texto */
  bolinha?: string;
};

export default function Chip({
  rotulo,
  ativo = false,
  onPress,
  icone,
  contagem,
  tom = COLORS.primary,
  tomTexto = COLORS.white,
  bolinha,
}: Props) {
  const corTexto = ativo ? tomTexto : COLORS.textSecondary;

  return (
    <PressableScale
      onPress={() => {
        haptics.toque();
        onPress();
      }}
      escala={0.95}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={rotulo}
      style={[
        styles.chip,
        ativo
          ? { backgroundColor: tom, borderColor: tom }
          : styles.chipInativo,
      ]}
    >
      {bolinha ? (
        <View style={[styles.bolinha, { backgroundColor: bolinha }]} />
      ) : null}

      {icone ? <Ionicons name={icone} size={15} color={corTexto} /> : null}

      <Text style={[styles.texto, { color: corTexto }]}>{rotulo}</Text>

      {contagem !== undefined ? (
        <Text
          style={[
            styles.contagem,
            { color: ativo ? tomTexto : COLORS.textMuted, opacity: ativo ? 0.8 : 1 },
          ]}
        >
          {contagem}
        </Text>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  chipInativo: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },

  texto: {
    fontSize: 14,
    fontWeight: "700",
  },

  contagem: {
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },

  bolinha: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
});
