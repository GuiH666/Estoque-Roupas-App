import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import { criarTabela } from "../../src/database/database";
import { buscarProdutos } from "../../src/services/produtoService";
import { listarMovimentacoes } from "../../src/services/movimentacaoService";
import { Produto } from "../../src/types/Produto";
import { Movimentacao } from "../../src/types/Movimentacao";

import AnimatedBar from "../../src/components/ui/AnimatedBar";
import EmptyState from "../../src/components/ui/EmptyState";
import PressableScale from "../../src/components/ui/PressableScale";
import ScreenHeader from "../../src/components/ui/ScreenHeader";

import { COLORS } from "../../src/theme/colors";
import { GUTTER, TYPE } from "../../src/theme/tokens";
import {
  chaveDoDia,
  formatarInteiro,
  formatarMoeda,
  inicialDoDia,
  lerDataMovimentacao,
} from "../../src/utils/format";
import { STATUS_INFO, statusDoEstoque } from "../../src/utils/estoque";
import { haptics } from "../../src/utils/haptics";

type Ranking = "pecas" | "valor";

const ALTURA_MAXIMA_BARRA = 54;

export default function DashboardScreen() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [ranking, setRanking] = useState<Ranking>("pecas");

  useFocusEffect(
    useCallback(() => {
      criarTabela();
      setProdutos(buscarProdutos());
      setMovimentacoes(listarMovimentacoes());
    }, [])
  );

  function editar(produto: Produto) {
    router.push({ pathname: "/produto", params: { id: String(produto.id) } });
  }

  /* ---------- Cálculos ---------- */

  const geral = useMemo(() => {
    let pecas = 0;
    let valor = 0;

    produtos.forEach((p) => {
      pecas += p.quantidade;
      valor += p.quantidade * p.preco;
    });

    return { pecas, valor, precoMedio: pecas > 0 ? valor / pecas : 0 };
  }, [produtos]);

  const categorias = useMemo(() => {
    const mapa: Record<string, { pecas: number; valor: number }> = {};

    produtos.forEach((p) => {
      const nome = p.categoria || "Sem categoria";
      if (!mapa[nome]) mapa[nome] = { pecas: 0, valor: 0 };
      mapa[nome].pecas += p.quantidade;
      mapa[nome].valor += p.quantidade * p.preco;
    });

    return Object.entries(mapa)
      .map(([nome, dados]) => ({ nome, ...dados }))
      .sort((a, b) => b.pecas - a.pecas);
  }, [produtos]);

  const semana = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const mapa: Record<string, { entradas: number; saidas: number }> = {};

    const dias = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(hoje);
      dia.setDate(hoje.getDate() - (6 - i));
      mapa[chaveDoDia(dia)] = { entradas: 0, saidas: 0 };
      return dia;
    });

    movimentacoes.forEach((mov) => {
      const alvo = mapa[lerDataMovimentacao(mov.data).dia];
      if (!alvo) return;

      if (mov.tipo === "entrada") alvo.entradas += mov.quantidade;
      else alvo.saidas += mov.quantidade;
    });

    const lista = dias.map((dia, i) => ({
      inicial: inicialDoDia(dia),
      hoje: i === 6,
      ...mapa[chaveDoDia(dia)],
    }));

    return {
      lista,
      entradas: lista.reduce((s, d) => s + d.entradas, 0),
      saidas: lista.reduce((s, d) => s + d.saidas, 0),
      maximo: Math.max(1, ...lista.flatMap((d) => [d.entradas, d.saidas])),
    };
  }, [movimentacoes]);

  const topProdutos = useMemo(() => {
    const valorDe = (p: Produto) =>
      ranking === "pecas" ? p.quantidade : p.quantidade * p.preco;

    return [...produtos].sort((a, b) => valorDe(b) - valorDe(a)).slice(0, 5);
  }, [produtos, ranking]);

  const reposicao = useMemo(
    () =>
      produtos
        .filter((p) => statusDoEstoque(p.quantidade) !== "ok")
        .sort((a, b) => a.quantidade - b.quantidade),
    [produtos]
  );

  const categoriasVisiveis = categorias.slice(0, 6);
  const totalPecasCategorias = Math.max(1, geral.pecas);
  const maiorCategoria = Math.max(1, categorias[0]?.pecas ?? 1);
  const lider = categorias[0];

  /* ---------- Tela ---------- */

  const semProdutos = produtos.length === 0;

  return (
    <View style={styles.tela}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        <ScreenHeader
          titulo="Dashboard"
          subtitulo="Como está o seu estoque, em números"
        />

        {semProdutos ? (
          <View style={styles.pad}>
            <EmptyState
              icone="stats-chart-outline"
              titulo="Ainda não há dados"
              texto="Cadastre produtos e registre entradas e saídas para ver os números aqui."
              acao="Cadastrar produto"
              onAcao={() => router.push("/produto")}
            />
          </View>
        ) : (
          <View style={styles.pad}>
            {/* Indicadores */}
            <View style={styles.indicadores}>
              <View style={styles.indicadorLinha}>
                <Indicador
                  cor={COLORS.success}
                  icone="arrow-up"
                  rotulo="Entradas"
                  valor={formatarInteiro(semana.entradas)}
                  sufixo="peças nos últimos 7 dias"
                />
                <View style={styles.indicadorVertical} />
                <Indicador
                  cor={COLORS.danger}
                  icone="arrow-down"
                  rotulo="Saídas"
                  valor={formatarInteiro(semana.saidas)}
                  sufixo="peças nos últimos 7 dias"
                />
              </View>

              <View style={styles.indicadorHorizontal} />

              <View style={styles.indicadorLinha}>
                <Indicador
                  cor={COLORS.thread}
                  icone="pricetag"
                  rotulo="Preço médio"
                  valor={formatarMoeda(geral.precoMedio)}
                  sufixo="por peça em estoque"
                />
                <View style={styles.indicadorVertical} />
                <Indicador
                  cor={COLORS.primaryLight}
                  icone="trophy"
                  rotulo="Categoria líder"
                  valor={lider?.nome ?? "—"}
                  sufixo={lider ? `${formatarInteiro(lider.pecas)} peças` : undefined}
                />
              </View>
            </View>

            {/* Movimentação da semana */}
            <Titulo texto="Movimentação da semana" />

            <View style={styles.cartao}>
              <View style={styles.grafico}>
                {/* linha de base: acima ficam as entradas, abaixo as saídas */}
                <View pointerEvents="none" style={styles.linhaBase} />

                {semana.lista.map((dia, indice) => (
                  <View
                    key={indice}
                    style={styles.coluna}
                    accessible
                    accessibilityLabel={`${dia.hoje ? "Hoje" : "Dia"}: ${dia.entradas} entradas e ${dia.saidas} saídas`}
                  >
                    {/* Entradas, para cima */}
                    <View style={styles.metadeCima}>
                      {dia.entradas > 0 ? (
                        <>
                          <Text style={[styles.valorBarra, { color: COLORS.success }]}>
                            {dia.entradas}
                          </Text>
                          <View
                            style={[
                              styles.barra,
                              {
                                backgroundColor: COLORS.success,
                                height: Math.max(
                                  5,
                                  (dia.entradas / semana.maximo) *
                                    ALTURA_MAXIMA_BARRA
                                ),
                              },
                            ]}
                          />
                        </>
                      ) : (
                        <View style={styles.barraVazia} />
                      )}
                    </View>

                    {/* Saídas, para baixo */}
                    <View style={styles.metadeBaixo}>
                      {dia.saidas > 0 ? (
                        <>
                          <View
                            style={[
                              styles.barra,
                              {
                                backgroundColor: COLORS.danger,
                                height: Math.max(
                                  5,
                                  (dia.saidas / semana.maximo) *
                                    ALTURA_MAXIMA_BARRA
                                ),
                              },
                            ]}
                          />
                          <Text style={[styles.valorBarra, { color: COLORS.danger }]}>
                            {dia.saidas}
                          </Text>
                        </>
                      ) : (
                        <View style={styles.barraVazia} />
                      )}
                    </View>

                    <Text style={[styles.diaTexto, dia.hoje && styles.diaHoje]}>
                      {dia.inicial}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.legendaGrafico}>
                <View style={styles.legendaItem}>
                  <Ionicons name="arrow-up" size={14} color={COLORS.success} />
                  <Text style={styles.legendaTexto}>Entradas</Text>
                </View>
                <View style={styles.legendaItem}>
                  <Ionicons name="arrow-down" size={14} color={COLORS.danger} />
                  <Text style={styles.legendaTexto}>Saídas</Text>
                </View>
              </View>
            </View>

            {/* Categorias */}
            <Titulo texto="Peças por categoria" />

            <View style={styles.cartao}>
              {categoriasVisiveis.map((cat, indice) => {
                const parte = Math.round((cat.pecas / totalPecasCategorias) * 100);

                return (
                  <View
                    key={cat.nome}
                    style={[
                      styles.categoria,
                      indice < categoriasVisiveis.length - 1 &&
                        styles.categoriaEspaco,
                    ]}
                  >
                    <View style={styles.categoriaTopo}>
                      <Text style={styles.categoriaNome} numberOfLines={1}>
                        {cat.nome}
                      </Text>

                      <Text style={styles.categoriaPecas}>
                        {formatarInteiro(cat.pecas)}{" "}
                        <Text style={styles.categoriaParte}>({parte}%)</Text>
                      </Text>
                    </View>

                    <AnimatedBar
                      proporcao={cat.pecas / maiorCategoria}
                      cor={indice === 0 ? COLORS.primary : COLORS.primaryLight}
                      atraso={indice * 90}
                    />

                    <Text style={styles.categoriaValor}>
                      {formatarMoeda(cat.valor)} em estoque
                    </Text>
                  </View>
                );
              })}

              {categorias.length > categoriasVisiveis.length ? (
                <Text style={styles.maisCategorias}>
                  + {categorias.length - categoriasVisiveis.length}{" "}
                  {categorias.length - categoriasVisiveis.length === 1
                    ? "categoria"
                    : "categorias"}{" "}
                  com menos peças
                </Text>
              ) : null}
            </View>

            {/* Ranking */}
            <Titulo texto="Maiores estoques" />

            <View style={styles.segmentos}>
              {(
                [
                  ["pecas", "Por peças"],
                  ["valor", "Por valor"],
                ] as [Ranking, string][]
              ).map(([valor, texto]) => {
                const ativo = ranking === valor;

                return (
                  <PressableScale
                    key={valor}
                    escala={0.97}
                    style={[styles.segmento, ativo && styles.segmentoAtivo]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: ativo }}
                    onPress={() => {
                      haptics.toque();
                      setRanking(valor);
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
                  </PressableScale>
                );
              })}
            </View>

            <View style={styles.lista}>
              {topProdutos.map((produto, indice) => (
                <PressableScale
                  key={produto.id}
                  escala={0.985}
                  onPress={() => editar(produto)}
                  style={[
                    styles.linha,
                    indice < topProdutos.length - 1 && styles.linhaDivisor,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.posicao}>{indice + 1}</Text>

                  <View style={styles.linhaTextos}>
                    <Text style={styles.linhaNome} numberOfLines={1}>
                      {produto.nome}
                    </Text>
                    <Text style={styles.linhaSub} numberOfLines={1}>
                      {[produto.categoria, produto.tamanho, produto.cor]
                        .filter(Boolean)
                        .join("  •  ")}
                    </Text>
                  </View>

                  <Text style={styles.linhaValor}>
                    {ranking === "pecas"
                      ? `${formatarInteiro(produto.quantidade)} un.`
                      : formatarMoeda(produto.quantidade * produto.preco)}
                  </Text>
                </PressableScale>
              ))}
            </View>

            {/* Reposição */}
            <Titulo
              texto="Precisam de reposição"
              acao={reposicao.length > 5 ? "Ver todos" : undefined}
              onAcao={() =>
                router.push({
                  pathname: "/estoque",
                  params: { filtro: "baixo", t: String(Date.now()) },
                })
              }
            />

            {reposicao.length === 0 ? (
              <View style={styles.tudoCerto}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.success}
                />
                <Text style={styles.tudoCertoTexto}>
                  Tudo em dia. Nenhum produto com 3 unidades ou menos.
                </Text>
              </View>
            ) : (
              <View style={styles.lista}>
                {reposicao.slice(0, 5).map((produto, indice, vetor) => {
                  const info = STATUS_INFO[statusDoEstoque(produto.quantidade)];

                  return (
                    <PressableScale
                      key={produto.id}
                      escala={0.985}
                      onPress={() => editar(produto)}
                      style={[
                        styles.linha,
                        indice < vetor.length - 1 && styles.linhaDivisor,
                      ]}
                      accessibilityRole="button"
                    >
                      <View
                        style={[styles.pilula, { backgroundColor: info.fundo }]}
                      >
                        <Text style={[styles.pilulaNumero, { color: info.cor }]}>
                          {produto.quantidade}
                        </Text>
                      </View>

                      <View style={styles.linhaTextos}>
                        <Text style={styles.linhaNome} numberOfLines={1}>
                          {produto.nome}
                        </Text>
                        <Text style={styles.linhaSub} numberOfLines={1}>
                          {[produto.categoria, produto.tamanho, produto.cor]
                            .filter(Boolean)
                            .join("  •  ")}
                        </Text>
                      </View>

                      <Text style={[styles.pilulaRotulo, { color: info.cor }]}>
                        {info.rotulo}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------- Pedaços da tela ---------- */

function Titulo({
  texto,
  acao,
  onAcao,
}: {
  texto: string;
  acao?: string;
  onAcao?: () => void;
}) {
  return (
    <View style={styles.titulo}>
      <Text style={styles.tituloTexto}>{texto}</Text>

      {acao && onAcao ? (
        <PressableScale onPress={onAcao} hitSlop={10} escala={0.94}>
          <Text style={styles.tituloAcao}>{acao}</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

function Indicador({
  cor,
  icone,
  rotulo,
  valor,
  sufixo,
}: {
  cor: string;
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
  sufixo?: string;
}) {
  return (
    <View style={styles.indicador}>
      <View style={styles.indicadorCabeca}>
        <Ionicons name={icone} size={14} color={cor} />
        <Text style={styles.indicadorRotulo} numberOfLines={1}>
          {rotulo}
        </Text>
      </View>

      <Text
        style={styles.indicadorValor}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
      >
        {valor}
      </Text>

      {sufixo ? <Text style={styles.indicadorSufixo}>{sufixo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  conteudo: {
    paddingBottom: 48,
  },

  pad: {
    paddingHorizontal: GUTTER,
  },

  /* indicadores em um único painel */
  indicadores: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  indicadorLinha: {
    flexDirection: "row",
  },

  indicadorVertical: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
    opacity: 0.8,
  },

  indicadorHorizontal: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    opacity: 0.8,
  },

  indicador: {
    flex: 1,
    padding: 18,
    minHeight: 104,
    justifyContent: "center",
  },

  indicadorCabeca: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  indicadorRotulo: {
    ...TYPE.small,
    flexShrink: 1,
  },

  indicadorValor: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: 8,
    fontVariant: ["tabular-nums"],
  },

  indicadorSufixo: {
    ...TYPE.small,
    marginTop: 1,
  },

  /* títulos de seção */
  titulo: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 34,
    marginBottom: 14,
  },

  tituloTexto: {
    ...TYPE.heading,
  },

  tituloAcao: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: "700",
  },

  cartao: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    padding: 18,
  },

  /* gráfico */
  grafico: {
    flexDirection: "row",
    gap: 6,
  },

  coluna: {
    flex: 1,
    alignItems: "center",
  },

  metadeCima: {
    height: ALTURA_MAXIMA_BARRA + 20,
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 3,
  },

  metadeBaixo: {
    height: ALTURA_MAXIMA_BARRA + 20,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 3,
  },

  linhaBase: {
    position: "absolute",
    left: 0,
    right: 0,
    top: ALTURA_MAXIMA_BARRA + 20,
    height: 1,
    backgroundColor: COLORS.border,
  },

  barra: {
    width: 16,
    borderRadius: 6,
  },

  barraVazia: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.surfaceRaised,
  },

  valorBarra: {
    fontSize: 12,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  diaTexto: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },

  diaHoje: {
    color: COLORS.thread,
  },

  legendaGrafico: {
    flexDirection: "row",
    gap: 18,
    marginTop: 14,
  },

  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  legendaTexto: {
    ...TYPE.small,
  },

  /* categorias */
  categoria: {},

  categoriaEspaco: {
    marginBottom: 20,
  },

  categoriaTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 9,
    gap: 12,
  },

  categoriaNome: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  categoriaPecas: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  categoriaParte: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  categoriaValor: {
    ...TYPE.small,
    marginTop: 7,
  },

  maisCategorias: {
    ...TYPE.small,
    marginTop: 18,
    textAlign: "center",
  },

  /* ranking */
  segmentos: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  segmento: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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

  lista: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 16,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },

  linhaDivisor: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  posicao: {
    width: 26,
    textAlign: "center",
    color: COLORS.thread,
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
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
  },

  linhaValor: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  /* reposição */
  pilula: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  pilulaNumero: {
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  pilulaRotulo: {
    fontSize: 13,
    fontWeight: "800",
  },

  tudoCerto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.successBackground,
  },

  tudoCertoTexto: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
