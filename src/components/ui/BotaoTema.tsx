import React from "react";
import { Ionicons } from "@expo/vector-icons";

import PressableScale from "./PressableScale";
import { COLORS } from "../../theme/colors";
import { criarEstilos } from "../../theme/criarEstilos";
import { Preferencia } from "../../theme/tema";
import { useTema } from "../../theme/TemaProvider";
import { avisos } from "../../utils/avisos";
import { haptics } from "../../utils/haptics";

/** Ordem em que o botão troca: automático, claro, escuro, e volta */
const PROXIMA: Record<Preferencia, Preferencia> = {
  sistema: "claro",
  claro: "escuro",
  escuro: "sistema",
};

const NOME: Record<Preferencia, string> = {
  sistema: "Tema automático (segue o celular)",
  claro: "Tema claro",
  escuro: "Tema escuro",
};

const ICONE: Record<Preferencia, keyof typeof Ionicons.glyphMap> = {
  sistema: "contrast-outline",
  claro: "sunny",
  escuro: "moon",
};

/**
 * Botão redondo que troca o tema do app. Fica no cabeçalho da tela inicial.
 * Como trocar o tema recria as telas, o aviso de confirmação é deixado
 * como recado e aparece quando a tela volta.
 */
export default function BotaoTema() {
  const { preferencia, escolher } = useTema();

  return (
    <PressableScale
      escala={0.9}
      style={styles.botao}
      accessibilityRole="button"
      accessibilityLabel={`${NOME[preferencia]}. Toque para trocar.`}
      onPress={() => {
        haptics.toque();
        const proxima = PROXIMA[preferencia];
        avisos.definir(NOME[proxima]);
        escolher(proxima);
      }}
    >
      <Ionicons name={ICONE[preferencia]} size={21} color={COLORS.text} />
    </PressableScale>
  );
}

const styles = criarEstilos(() => ({
  botao: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
}));
