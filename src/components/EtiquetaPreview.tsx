import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Costura from "./ui/Costura";
import { COLORS } from "../theme/colors";
import { corParaHex } from "../utils/cores";
import { formatarMoeda } from "../utils/format";
import { STATUS_INFO, statusDoEstoque } from "../utils/estoque";

type Props = {
  nome: string;
  categoria: string;
  tamanho: string;
  cor: string;
  quantidade: number;
  preco: number;
};

const LARGURA_CANHOTO = 122;
const TAMANHO_RECORTE = 22;

/**
 * Etiqueta de roupa que se preenche enquanto a pessoa digita.
 * Mostra, em tempo real, como o produto vai aparecer no estoque.
 */
export default function EtiquetaPreview({
  nome,
  categoria,
  tamanho,
  cor,
  quantidade,
  preco,
}: Props) {
  const nomeLimpo = nome.trim();
  const categoriaLimpa = categoria.trim();
  const tamanhoLimpo = tamanho.trim();
  const corLimpa = cor.trim();
  const hexCor = corParaHex(corLimpa);

  const status = statusDoEstoque(quantidade);
  const info = STATUS_INFO[status];

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Prévia: ${nomeLimpo || "produto sem nome"}, ${formatarMoeda(
        preco
      )}, ${quantidade} unidades`}
    >
      <Costura raio={18} inset={6} />

      {/* Lado principal */}
      <View style={styles.principal}>
        <Text
          style={[styles.nome, !nomeLimpo && styles.vazio]}
          numberOfLines={2}
        >
          {nomeLimpo || "Nome da peça"}
        </Text>

        <Text
          style={[styles.categoria, !categoriaLimpa && styles.vazio]}
          numberOfLines={1}
        >
          {categoriaLimpa || "Categoria"}
        </Text>

        <View style={styles.meta}>
          <View style={[styles.tag, !tamanhoLimpo && styles.tagVazia]}>
            <Text style={[styles.tagTexto, !tamanhoLimpo && styles.vazio]}>
              {tamanhoLimpo || "Tam."}
            </Text>
          </View>

          <View style={[styles.tag, !corLimpa && styles.tagVazia]}>
            {corLimpa ? (
              <View
                style={[
                  styles.bolinha,
                  { backgroundColor: hexCor || COLORS.textMuted },
                ]}
              />
            ) : null}

            <Text
              style={[styles.tagTexto, !corLimpa && styles.vazio]}
              numberOfLines={1}
            >
              {corLimpa || "Cor"}
            </Text>
          </View>
        </View>
      </View>

      {/* Picote */}
      <View style={styles.picote} pointerEvents="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={styles.picotePonto} />
        ))}
      </View>

      {/* Canhoto com preço e quantidade */}
      <View style={styles.canhoto}>
        <Text style={styles.canhotoRotulo}>Preço</Text>

        <Text
          style={styles.preco}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {formatarMoeda(preco)}
        </Text>

        <View style={[styles.qtd, { backgroundColor: info.fundo }]}>
          <Text style={[styles.qtdTexto, { color: info.cor }]}>
            {quantidade} un.
          </Text>
        </View>
      </View>

      {/* Recortes do picote */}
      <View
        pointerEvents="none"
        style={[
          styles.recorte,
          { top: -TAMANHO_RECORTE / 2, right: LARGURA_CANHOTO - TAMANHO_RECORTE / 2 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.recorte,
          { bottom: -TAMANHO_RECORTE / 2, right: LARGURA_CANHOTO - TAMANHO_RECORTE / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    minHeight: 138,
  },

  principal: {
    flex: 1,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 14,
    justifyContent: "center",
  },

  nome: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  categoria: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },

  vazio: {
    color: COLORS.textMuted,
    opacity: 0.55,
  },

  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 9,
    backgroundColor: COLORS.surfaceRaised,
    maxWidth: 140,
  },

  tagVazia: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  tagTexto: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },

  bolinha: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  picote: {
    width: 2,
    marginVertical: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },

  picotePonto: {
    width: 2,
    height: 5,
    borderRadius: 1,
    backgroundColor: COLORS.border,
  },

  canhoto: {
    width: LARGURA_CANHOTO,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  canhotoRotulo: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },

  preco: {
    color: COLORS.thread,
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
    maxWidth: "100%",
  },

  qtd: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
  },

  qtdTexto: {
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  recorte: {
    position: "absolute",
    width: TAMANHO_RECORTE,
    height: TAMANHO_RECORTE,
    borderRadius: TAMANHO_RECORTE / 2,
    backgroundColor: COLORS.background,
  },
});
