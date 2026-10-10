import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Costura from "./Costura";
import PressableScale from "./PressableScale";
import { COLORS } from "../../theme/colors";
import { TYPE } from "../../theme/tokens";
import { haptics } from "../../utils/haptics";

type Props = {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  texto: string;
  /** Texto do botão (se não vier, não mostra botão) */
  acao?: string;
  onAcao?: () => void;
};

/** Tela vazia: explica o que fazer em seguida, sem dramatizar. */
export default function EmptyState({
  icone,
  titulo,
  texto,
  acao,
  onAcao,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icone}>
        <Costura raio={34} inset={5} />
        <Ionicons name={icone} size={30} color={COLORS.thread} />
      </View>

      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>

      {acao && onAcao ? (
        <PressableScale
          style={styles.botao}
          onPress={() => {
            haptics.leve();
            onAcao();
          }}
          accessibilityRole="button"
        >
          <Text style={styles.botaoTexto}>{acao}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 36,
  },

  icone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  titulo: {
    ...TYPE.heading,
    textAlign: "center",
  },

  texto: {
    ...TYPE.body,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 21,
  },

  botao: {
    marginTop: 20,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoTexto: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
});
