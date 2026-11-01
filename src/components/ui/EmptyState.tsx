import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Costura from "./Costura";
import PressableScale from "./PressableScale";
import { COLORS } from "../../theme/colors";
import { TYPE } from "../../theme/tokens";
import { haptics } from "../../utils/haptics";
import { criarEstilos } from "../../theme/criarEstilos";

type Props = {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  texto: string;
  /** Texto do botão (se não vier, não mostra botão) */
  acao?: string;
  onAcao?: () => void;
  /** "erro" pinta o ícone e a costura de vermelho */
  tom?: "padrao" | "erro";
  /** Linha pequena extra (ex.: mensagem técnica de um erro) */
  detalhe?: string;
};

/** Tela vazia: explica o que fazer em seguida, sem dramatizar. */
export default function EmptyState({
  icone,
  titulo,
  texto,
  acao,
  onAcao,
  tom = "padrao",
  detalhe,
}: Props) {
  const erro = tom === "erro";

  return (
    <View
      style={styles.container}
      accessibilityLiveRegion={erro ? "assertive" : "polite"}
    >
      <View
        style={[styles.icone, erro && { backgroundColor: COLORS.dangerBackground }]}
      >
        <Costura
          raio={34}
          inset={5}
          cor={erro ? "rgba(255, 107, 124, 0.4)" : undefined}
        />
        <Ionicons
          name={icone}
          size={30}
          color={erro ? COLORS.danger : COLORS.thread}
        />
      </View>

      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={styles.texto}>{texto}</Text>
      {detalhe ? (
        <Text style={styles.detalhe} numberOfLines={3} selectable>
          {detalhe}
        </Text>
      ) : null}

      {acao && onAcao ? (
        <PressableScale
          style={styles.botao}
          onPress={() => {
            haptics.leve();
            onAcao();
          }}
          accessibilityRole="button"
          accessibilityLabel={acao}
        >
          <Text style={styles.botaoTexto}>{acao}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = criarEstilos(() => ({
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

  detalhe: {
    ...TYPE.small,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 10,
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
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
}));
