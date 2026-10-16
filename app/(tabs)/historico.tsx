import React, { useCallback, useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { criarTabela } from "../../src/database/database";
import { listarMovimentacoes } from "../../src/services/movimentacaoService";
import { Movimentacao } from "../../src/types/Movimentacao";

import EmptyState from "../../src/components/ui/EmptyState";
import PressableScale from "../../src/components/ui/PressableScale";
import ScreenHeader from "../../src/components/ui/ScreenHeader";

import { COLORS } from "../../src/theme/colors";
import { GUTTER, TYPE } from "../../src/theme/tokens";
import {
  formatarInteiro,
  lerDataMovimentacao,
  rotuloDoDia,
} from "../../src/utils/format";
import { haptics } from "../../src/utils/haptics";

type Filtro = "todos" | "entrada" | "saida";

type Secao = {
  title: string;
  data: Movimentacao[];
  entradas: number;
  saidas: number;
};

const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "entrada", texto: "Entradas" },
  { valor: "saida", texto: "Saídas" },
];

export default function HistoricoScreen() {
  const router = useRouter();

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  useFocusEffect(
    useCallback(() => {
      criarTabela();
      setMovimentacoes(listarMovimentacoes());
    }, [])
  );

  const totais = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    let qtdEntradas = 0;
    let qtdSaidas = 0;

    movimentacoes.forEach((m) => {
      if (m.tipo === "entrada") {
        entradas += 1;
        qtdEntradas += m.quantidade;
      } else {
        saidas += 1;
        qtdSaidas += m.quantidade;
      }
    });

    return { entradas, saidas, qtdEntradas, qtdSaidas };
  }, [movimentacoes]);

  const secoes = useMemo<Secao[]>(() => {
    const filtradas =
      filtro === "todos"
        ? movimentacoes
        : movimentacoes.filter((m) => m.tipo === filtro);

    const hoje = new Date();
    const grupos: Secao[] = [];
    const indicePorDia: Record<string, number> = {};

    filtradas.forEach((mov) => {
      const info = lerDataMovimentacao(mov.data);

      if (indicePorDia[info.dia] === undefined) {
        indicePorDia[info.dia] = grupos.length;
        grupos.push({
          title: rotuloDoDia(info, hoje),
          data: [],
          entradas: 0,
          saidas: 0,
        });
      }

      const grupo = grupos[indicePorDia[info.dia]];
      grupo.data.push(mov);

      if (mov.tipo === "entrada") grupo.entradas += mov.quantidade;
      else grupo.saidas += mov.quantidade;
    });

    return grupos;
  }, [movimentacoes, filtro]);

  const contagemDoFiltro: Record<Filtro, number> = {
    todos: movimentacoes.length,
    entrada: totais.entradas,
    saida: totais.saidas,
  };

  return (
    <View style={styles.tela}>
      <SectionList
        sections={secoes}
        keyExtractor={(item, indice) => String(item.id ?? indice)}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              titulo="Histórico"
              subtitulo={
                movimentacoes.length === 0
                  ? "Nenhuma movimentação ainda"
                  : `${formatarInteiro(movimentacoes.length)} ${
                      movimentacoes.length === 1
                        ? "movimentação registrada"
                        : "movimentações registradas"
                    }`
              }
            />

            <View style={styles.pad}>
              {/* Resumo */}
              <View style={styles.resumo}>
                <View style={styles.resumoLado}>
                  <View
                    style={[
                      styles.resumoIcone,
                      { backgroundColor: COLORS.successBackground },
                    ]}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={18}
                      color={COLORS.success}
                    />
                  </View>

                  <View style={styles.resumoTextos}>
                    <Text style={[styles.resumoNumero, { color: COLORS.success }]}>
                      {formatarInteiro(totais.qtdEntradas)}
                    </Text>
                    <Text style={styles.resumoRotulo}>peças entraram</Text>
                  </View>
                </View>

                <View style={styles.resumoLinha} />

                <View style={styles.resumoLado}>
                  <View
                    style={[
                      styles.resumoIcone,
                      { backgroundColor: COLORS.dangerBackground },
                    ]}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={18}
                      color={COLORS.danger}
                    />
                  </View>

                  <View style={styles.resumoTextos}>
                    <Text style={[styles.resumoNumero, { color: COLORS.danger }]}>
                      {formatarInteiro(totais.qtdSaidas)}
                    </Text>
                    <Text style={styles.resumoRotulo}>peças saíram</Text>
                  </View>
                </View>
              </View>

              {/* Filtro */}
              <View style={styles.segmentos} accessibilityRole="tablist">
                {FILTROS.map(({ valor, texto }) => {
                  const ativo = filtro === valor;

                  return (
                    <PressableScale
                      key={valor}
                      escala={0.96}
                      style={[styles.segmento, ativo && styles.segmentoAtivo]}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: ativo }}
                      onPress={() => {
                        haptics.toque();
                        setFiltro(valor);
                      }}
                    >
                      <Text
                        style={[
                          styles.segmentoTexto,
                          ativo && styles.segmentoTextoAtivo,
                        ]}
                      >
                        {texto}
                      </Text>
                      <Text
                        style={[
                          styles.segmentoContagem,
                          ativo && styles.segmentoContagemAtiva,
                        ]}
                      >
                        {contagemDoFiltro[valor]}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>{section.title}</Text>

            <View style={styles.secaoSaldo}>
              {section.entradas > 0 ? (
                <Text style={[styles.saldo, { color: COLORS.success }]}>
                  +{section.entradas}
                </Text>
              ) : null}

              {section.saidas > 0 ? (
                <Text style={[styles.saldo, { color: COLORS.danger }]}>
                  −{section.saidas}
                </Text>
              ) : null}
            </View>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const entrada = item.tipo === "entrada";
          const primeiro = index === 0;
          const ultimo = index === section.data.length - 1;
          const info = lerDataMovimentacao(item.data);

          return (
            <View style={styles.pad}>
              <View
                style={[
                  styles.linha,
                  primeiro && styles.linhaPrimeira,
                  ultimo && styles.linhaUltima,
                  !ultimo && styles.linhaDivisor,
                ]}
              >
                <View
                  style={[
                    styles.linhaIcone,
                    {
                      backgroundColor: entrada
                        ? COLORS.successBackground
                        : COLORS.dangerBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name={entrada ? "arrow-up" : "arrow-down"}
                    size={19}
                    color={entrada ? COLORS.success : COLORS.danger}
                  />
                </View>

                <View style={styles.linhaTextos}>
                  <Text style={styles.linhaNome} numberOfLines={1}>
                    {item.nomeProduto}
                  </Text>

                  <Text style={styles.linhaSub}>
                    {entrada ? "Entrada" : "Saída"}
                    {info.hora ? `  •  ${info.hora}` : ""}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.linhaQtd,
                    { color: entrada ? COLORS.success : COLORS.danger },
                  ]}
                >
                  {entrada ? "+" : "−"}
                  {item.quantidade}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          movimentacoes.length === 0 ? (
            <EmptyState
              icone="time-outline"
              titulo="Nenhuma movimentação"
              texto="Use o + e o − nos produtos do estoque. Cada entrada e saída fica registrada aqui."
              acao="Ir para o estoque"
              onAcao={() => router.push("/estoque")}
            />
          ) : (
            <EmptyState
              icone={filtro === "entrada" ? "arrow-up-outline" : "arrow-down-outline"}
              titulo={
                filtro === "entrada"
                  ? "Nenhuma entrada registrada"
                  : "Nenhuma saída registrada"
              }
              texto="Troque o filtro para ver as outras movimentações."
              acao="Mostrar todas"
              onAcao={() => setFiltro("todos")}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  lista: {
    paddingBottom: 40,
  },

  pad: {
    paddingHorizontal: GUTTER,
  },

  /* resumo */
  resumo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  resumoLado: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  resumoTextos: {
    flex: 1,
  },

  resumoIcone: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  resumoNumero: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
  },

  resumoRotulo: {
    ...TYPE.small,
    marginTop: 1,
  },

  resumoLinha: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
    opacity: 0.8,
  },

  /* filtro */
  segmentos: {
    flexDirection: "row",
    marginTop: 14,
    padding: 4,
    gap: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  segmento: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  segmentoAtivo: {
    backgroundColor: COLORS.primary,
  },

  segmentoTexto: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },

  segmentoTextoAtivo: {
    color: COLORS.white,
  },

  segmentoContagem: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },

  segmentoContagemAtiva: {
    color: "rgba(255,255,255,0.75)",
  },

  /* dias */
  secao: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingTop: 26,
    paddingBottom: 10,
  },

  secaoTitulo: {
    ...TYPE.bodyStrong,
    fontSize: 17,
  },

  secaoSaldo: {
    flexDirection: "row",
    gap: 10,
  },

  saldo: {
    fontSize: 14,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  /* linhas agrupadas em um único bloco por dia */
  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  linhaPrimeira: {
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  linhaUltima: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  linhaDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  linhaIcone: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  linhaTextos: {
    flex: 1,
  },

  linhaNome: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  linhaSub: {
    ...TYPE.caption,
    fontSize: 12,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },

  linhaQtd: {
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
