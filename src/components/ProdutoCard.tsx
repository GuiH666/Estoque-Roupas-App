import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Produto } from "../types/Produto";
import { COLORS } from "../theme/colors";
import { TYPE } from "../theme/tokens";
import { corEhClara, corParaHex } from "../utils/cores";
import { formatarMoeda } from "../utils/format";
import { STATUS_INFO, statusDoEstoque } from "../utils/estoque";
import { haptics } from "../utils/haptics";

import PressableScale from "./ui/PressableScale";
import { criarEstilos } from "../theme/criarEstilos";

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

  // Texto escuro sobre cores claras e claro sobre cores escuras
  const corDoTexto = hexCor
    ? corEhClara(hexCor)
      ? "#111114"
      : "#FFFFFF"
    : COLORS.text;

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
      {/* Bloco com a cor da peça e o tamanho em cima */}
      <View
        style={[
          styles.etiqueta,
          hexCor ? { backgroundColor: hexCor } : null,
        ]}
      >
        {tamanhoCurto ? (
          <Text style={[styles.etiquetaTexto, { color: corDoTexto }]}>
            {tamanho.toUpperCase()}
          </Text>
        ) : (
          <Ionicons name="shirt" size={24} color={corDoTexto} />
        )}
      </View>

      {/* Informações */}
      <View style={styles.centro}>
        <Text style={styles.nome} numberOfLines={2}>
          {produto.nome}
        </Text>

        <View style={styles.linha}>
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
            <Ionicons name="remove" size={20} color={COLORS.danger} />
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
              styles.botaoMais,
              pressed && styles.botaoStepPressionado,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Adicionar uma unidade de ${produto.nome}`}
          >
            <Ionicons name="add" size={20} color={COLORS.onPrimary} />
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

const styles = criarEstilos(() => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 26,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },

  etiqueta: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  etiquetaTexto: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  centro: {
    flex: 1,
    gap: 3,
  },

  nome: {
    ...TYPE.bodyStrong,
    fontWeight: "900",
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  detalhe: {
    ...TYPE.caption,
    flexShrink: 1,
  },

  preco: {
    color: COLORS.thread,
    fontSize: 15,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },

  status: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },

  statusTexto: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 999,
    padding: 3,
  },

  botaoStep: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoMais: {
    backgroundColor: COLORS.primary,
  },

  botaoStepPressionado: {
    opacity: 0.7,
  },

  botaoStepDesligado: {
    opacity: 0.3,
  },

  qtd: {
    minWidth: 28,
    textAlign: "center",
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },

  qtdEstatica: {
    alignItems: "center",
    minWidth: 44,
  },

  qtdEstaticaNumero: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"],
  },

  qtdEstaticaLabel: {
    ...TYPE.small,
    fontSize: 11,
  },
}));
