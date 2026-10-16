import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Produto } from "../types/Produto";
import { COLORS } from "../theme/colors";
import { TYPE } from "../theme/tokens";
import { corParaHex } from "../utils/cores";
import { formatarMoeda } from "../utils/format";
import { STATUS_INFO, statusDoEstoque } from "../utils/estoque";
import { haptics } from "../utils/haptics";

import Costura from "./ui/Costura";
import PressableScale from "./ui/PressableScale";

type Props = {
  produto: Produto;
  /** Toque no cartão (normalmente abre a edição) */
  onPress?: () => void;
  /** Se informado, aparece o botão de +1 */
  onEntrada?: () => void;
  /** Se informado, aparece o botão de -1 */
  onSaida?: () => void;
};

export default function ProdutoCard({
  produto,
  onPress,
  onEntrada,
  onSaida,
}: Props) {
  const status = statusDoEstoque(produto.quantidade);
  const info = STATUS_INFO[status];
  const hexCor = corParaHex(produto.cor);
  const temControles = !!(onEntrada || onSaida);

  const tamanho = (produto.tamanho || "").trim();
  const tamanhoCurto = tamanho.length > 0 && tamanho.length <= 3;

  const detalhes = [produto.categoria, tamanho && !tamanhoCurto ? tamanho : ""]
    .filter(Boolean)
    .join("  •  ");

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      escala={0.985}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${produto.nome}, ${produto.quantidade} unidades`}
      style={styles.card}
    >
      {/* Etiqueta com o tamanho */}
      <View style={styles.etiqueta}>
        <Costura raio={11} inset={3} />

        {tamanhoCurto ? (
          <Text style={styles.etiquetaTexto}>{tamanho.toUpperCase()}</Text>
        ) : (
          <Ionicons name="shirt-outline" size={22} color={COLORS.primaryLight} />
        )}
      </View>

      {/* Informações */}
      <View style={styles.centro}>
        <Text style={styles.nome} numberOfLines={2}>
          {produto.nome}
        </Text>

        <View style={styles.linha}>
          {hexCor || produto.cor ? (
            <View
              style={[
                styles.bolinha,
                { backgroundColor: hexCor || COLORS.textMuted },
              ]}
            />
          ) : null}

          <Text style={styles.detalhe} numberOfLines={1}>
            {[produto.cor, detalhes].filter(Boolean).join("  •  ") ||
              "Sem detalhes"}
          </Text>
        </View>

        <View style={styles.linha}>
          <Text style={styles.preco}>{formatarMoeda(produto.preco)}</Text>

          {status !== "ok" ? (
            <View style={[styles.status, { backgroundColor: info.fundo }]}>
              <Text style={[styles.statusTexto, { color: info.cor }]}>
                {info.rotulo}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Quantidade */}
      {temControles ? (
        <View
          style={[
            styles.stepper,
            status !== "ok" && { borderColor: info.cor + "66" },
          ]}
        >
          <Pressable
            onPress={() => {
              haptics.leve();
              onSaida?.();
            }}
            disabled={produto.quantidade <= 0}
            hitSlop={6}
            style={({ pressed }) => [
              styles.botaoStep,
              pressed && styles.botaoStepPressionado,
              produto.quantidade <= 0 && styles.botaoStepDesligado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Retirar uma unidade de ${produto.nome}`}
          >
            <Ionicons name="remove" size={18} color={COLORS.danger} />
          </Pressable>

          <Text
            style={[
              styles.qtd,
              status !== "ok" && { color: info.cor },
            ]}
          >
            {produto.quantidade}
          </Text>

          <Pressable
            onPress={() => {
              haptics.leve();
              onEntrada?.();
            }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.botaoStep,
              pressed && styles.botaoStepPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Adicionar uma unidade de ${produto.nome}`}
          >
            <Ionicons name="add" size={18} color={COLORS.success} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.qtdEstatica}>
          <Text
            style={[
              styles.qtdEstaticaNumero,
              status !== "ok" && { color: info.cor },
            ]}
          >
            {produto.quantidade}
          </Text>
          <Text style={styles.qtdEstaticaLabel}>un.</Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 20,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },

  etiqueta: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  etiquetaTexto: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  centro: {
    flex: 1,
    gap: 3,
  },

  nome: {
    ...TYPE.bodyStrong,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  bolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },

  detalhe: {
    ...TYPE.caption,
    flexShrink: 1,
  },

  preco: {
    color: COLORS.thread,
    fontSize: 14,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: "800",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    padding: 3,
  },

  botaoStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoStepPressionado: {
    backgroundColor: COLORS.surfaceRaised,
  },

  botaoStepDesligado: {
    opacity: 0.3,
  },

  qtd: {
    minWidth: 24,
    textAlign: "center",
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  qtdEstatica: {
    alignItems: "center",
    minWidth: 44,
  },

  qtdEstaticaNumero: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },

  qtdEstaticaLabel: {
    ...TYPE.small,
    fontSize: 11,
  },
});
