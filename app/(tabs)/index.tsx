import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Produto } from "../../src/types/Produto";
import { Movimentacao } from "../../src/types/Movimentacao";
import { criarTabela } from "../../src/database/database";
import {
  adicionarEstoque,
  buscarProdutos,
  removerEstoque,
} from "../../src/services/produtoService";
import { listarMovimentacoes } from "../../src/services/movimentacaoService";

import { COLORS } from "../../src/theme/colors";
import { GLOW, GUTTER, TYPE } from "../../src/theme/tokens";
import {
  dataPorExtenso,
  formatarInteiro,
  formatarMoeda,
  lerDataMovimentacao,
  rotuloDoDia,
  saudacao,
} from "../../src/utils/format";
import { statusDoEstoque } from "../../src/utils/estoque";
import { avisos } from "../../src/utils/avisos";
import { haptics } from "../../src/utils/haptics";

import ProdutoCard from "../../src/components/ProdutoCard";
import Costura from "../../src/components/ui/Costura";
import EmptyState from "../../src/components/ui/EmptyState";
import PressableScale from "../../src/components/ui/PressableScale";
import ScreenHeader from "../../src/components/ui/ScreenHeader";
import { useToast } from "../../src/components/ui/Toast";

function primeiraMaiuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function HomeScreen() {
  const router = useRouter();
  const { toast, mostrar } = useToast(24);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  const carregar = useCallback(() => {
    criarTabela();
    setProdutos(buscarProdutos());
    setMovimentacoes(listarMovimentacoes());
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();

      const aviso = avisos.consumir();
      if (aviso) mostrar(aviso);
    }, [carregar, mostrar])
  );

  /* ---------- Ações ---------- */

  function abrirCadastro() {
    router.push("/produto");
  }

  function editar(produto: Produto) {
    router.push({ pathname: "/produto", params: { id: String(produto.id) } });
  }

  function verEstoqueBaixo() {
    router.push({
      pathname: "/estoque",
      params: { filtro: "baixo", t: String(Date.now()) },
    });
  }

  function entradaEstoque(item: Produto) {
    try {
      adicionarEstoque(item);
      carregar();
    } catch (error: any) {
      Alert.alert(
        "Não foi possível adicionar",
        error?.message || "Tente novamente."
      );
    }
  }

  function saidaEstoque(item: Produto) {
    try {
      removerEstoque(item);
      carregar();
    } catch (error: any) {
      haptics.erro();
      Alert.alert(
        "Estoque indisponível",
        error?.message || "Não foi possível retirar o item."
      );
    }
  }

  /* ---------- Números ---------- */

  const resumo = useMemo(() => {
    let pecas = 0;
    let valor = 0;
    let ok = 0;
    let baixo = 0;
    let zerado = 0;

    produtos.forEach((p) => {
      pecas += p.quantidade;
      valor += p.quantidade * p.preco;

      const status = statusDoEstoque(p.quantidade);
      if (status === "ok") ok += 1;
      else if (status === "baixo") baixo += 1;
      else zerado += 1;
    });

    return {
      produtos: produtos.length,
      pecas,
      valor,
      precoMedio: pecas > 0 ? valor / pecas : 0,
      ok,
      baixo,
      zerado,
      precisamReposicao: baixo + zerado,
    };
  }, [produtos]);

  const ultimosCadastros = useMemo(
    () =>
      [...produtos]
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        .slice(0, 3),
    [produtos]
  );

  const recentes = movimentacoes.slice(0, 4);

  /* ---------- Tela ---------- */

  const vazio = produtos.length === 0;

  return (
    <View style={styles.tela}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        <ScreenHeader
          titulo={saudacao()}
          subtitulo={primeiraMaiuscula(dataPorExtenso())}
        />

        {vazio ? (
          <View style={styles.pad}>
            <EmptyState
              icone="shirt-outline"
              titulo="Seu estoque está vazio"
              texto="Cadastre a primeira peça para acompanhar quantidades, valores e movimentações."
              acao="Cadastrar primeira peça"
              onAcao={abrirCadastro}
            />
          </View>
        ) : (
          <View style={styles.pad}>
            {/* Cartão principal */}
            <View style={styles.hero}>
              <Costura raio={20} inset={8} />

              <Text style={styles.heroRotulo}>Valor em estoque</Text>

              <Text
                style={styles.heroValor}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
              >
                {formatarMoeda(resumo.valor)}
              </Text>

              {/* Saúde do estoque */}
              <View
                style={styles.saude}
                accessible
                accessibilityLabel={`${resumo.ok} produtos em dia, ${resumo.baixo} com estoque baixo, ${resumo.zerado} zerados`}
              >
                {resumo.ok > 0 ? (
                  <View
                    style={[
                      styles.saudeSegmento,
                      { flex: resumo.ok, backgroundColor: COLORS.success },
                    ]}
                  />
                ) : null}
                {resumo.baixo > 0 ? (
                  <View
                    style={[
                      styles.saudeSegmento,
                      { flex: resumo.baixo, backgroundColor: COLORS.warning },
                    ]}
                  />
                ) : null}
                {resumo.zerado > 0 ? (
                  <View
                    style={[
                      styles.saudeSegmento,
                      { flex: resumo.zerado, backgroundColor: COLORS.danger },
                    ]}
                  />
                ) : null}
              </View>

              <View style={styles.legenda}>
                <Legenda cor={COLORS.success} texto={`${resumo.ok} em dia`} />
                <Legenda cor={COLORS.warning} texto={`${resumo.baixo} baixo`} />
                <Legenda cor={COLORS.danger} texto={`${resumo.zerado} zerado`} />
              </View>

              <View style={styles.divisor} />

              <View style={styles.numeros}>
                <Numero
                  valor={formatarInteiro(resumo.produtos)}
                  rotulo="Produtos"
                />
                <View style={styles.numeroLinha} />
                <Numero
                  valor={formatarInteiro(resumo.pecas)}
                  rotulo="Peças"
                />
                <View style={styles.numeroLinha} />
                <Numero
                  valor={formatarMoeda(resumo.precoMedio)}
                  rotulo="Preço médio"
                />
              </View>
            </View>

            {/* Aviso de reposição */}
            {resumo.precisamReposicao > 0 ? (
              <PressableScale
                style={styles.aviso}
                onPress={verEstoqueBaixo}
                accessibilityRole="button"
                accessibilityLabel="Ver produtos que precisam de reposição"
              >
                <View style={styles.avisoIcone}>
                  <Ionicons name="alert" size={20} color={COLORS.thread} />
                </View>

                <View style={styles.avisoTextos}>
                  <Text style={styles.avisoTitulo}>
                    {resumo.precisamReposicao === 1
                      ? "1 produto precisa de reposição"
                      : `${resumo.precisamReposicao} produtos precisam de reposição`}
                  </Text>
                  <Text style={styles.avisoSub}>
                    Com 3 unidades ou menos. Toque para ver.
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textMuted}
                />
              </PressableScale>
            ) : null}

            {/* Ação principal */}
            <PressableScale
              style={[styles.botaoPrincipal, GLOW]}
              onPress={() => {
                haptics.medio();
                abrirCadastro();
              }}
              accessibilityRole="button"
            >
              <Ionicons name="add-circle" size={23} color={COLORS.white} />
              <Text style={styles.botaoPrincipalTexto}>Cadastrar produto</Text>
            </PressableScale>

            {/* Últimos cadastros */}
            <SecaoTitulo
              titulo="Últimos cadastros"
              acao="Ver estoque"
              onAcao={() => router.push("/estoque")}
            />

            {ultimosCadastros.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onPress={() => editar(produto)}
                onEntrada={() => entradaEstoque(produto)}
                onSaida={() => saidaEstoque(produto)}
              />
            ))}

            {/* Movimentações recentes */}
            <SecaoTitulo
              titulo="Movimentações recentes"
              acao={recentes.length > 0 ? "Ver histórico" : undefined}
              onAcao={() => router.push("/historico")}
            />

            {recentes.length === 0 ? (
              <View style={styles.semMov}>
                <Text style={styles.semMovTexto}>
                  Use o + e o − nos produtos acima. Cada entrada e saída
                  aparece aqui.
                </Text>
              </View>
            ) : (
              <View style={styles.listaMov}>
                {recentes.map((mov, indice) => {
                  const entrada = mov.tipo === "entrada";
                  const info = lerDataMovimentacao(mov.data);
                  const quando = [rotuloDoDia(info), info.hora]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <View
                      key={mov.id ?? indice}
                      style={[
                        styles.mov,
                        indice < recentes.length - 1 && styles.movBorda,
                      ]}
                    >
                      <View
                        style={[
                          styles.movIcone,
                          {
                            backgroundColor: entrada
                              ? COLORS.successBackground
                              : COLORS.dangerBackground,
                          },
                        ]}
                      >
                        <Ionicons
                          name={entrada ? "arrow-up" : "arrow-down"}
                          size={18}
                          color={entrada ? COLORS.success : COLORS.danger}
                        />
                      </View>

                      <View style={styles.movTextos}>
                        <Text style={styles.movNome} numberOfLines={1}>
                          {mov.nomeProduto}
                        </Text>
                        <Text style={styles.movQuando}>{quando}</Text>
                      </View>

                      <Text
                        style={[
                          styles.movQtd,
                          { color: entrada ? COLORS.success : COLORS.danger },
                        ]}
                      >
                        {entrada ? "+" : "−"}
                        {mov.quantidade}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {toast}
    </View>
  );
}

/* ---------- Pedaços da tela ---------- */

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <View style={styles.legendaItem}>
      <View style={[styles.legendaPonto, { backgroundColor: cor }]} />
      <Text style={styles.legendaTexto}>{texto}</Text>
    </View>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={styles.numero}>
      <Text
        style={styles.numeroValor}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {valor}
      </Text>
      <Text style={styles.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

function SecaoTitulo({
  titulo,
  acao,
  onAcao,
}: {
  titulo: string;
  acao?: string;
  onAcao?: () => void;
}) {
  return (
    <View style={styles.secao}>
      <Text style={styles.secaoTitulo}>{titulo}</Text>

      {acao && onAcao ? (
        <PressableScale
          onPress={onAcao}
          hitSlop={10}
          escala={0.94}
          accessibilityRole="button"
        >
          <Text style={styles.secaoAcao}>{acao}</Text>
        </PressableScale>
      ) : null}
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

  /* cartão principal */
  hero: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 26,
    paddingTop: 28,
    paddingBottom: 24,
  },

  heroRotulo: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  heroValor: {
    ...TYPE.display,
    color: COLORS.text,
    marginTop: 6,
  },

  saude: {
    flexDirection: "row",
    height: 8,
    gap: 3,
    marginTop: 22,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceRaised,
  },

  saudeSegmento: {
    height: 8,
    borderRadius: 4,
  },

  legenda: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 4,
    marginTop: 12,
  },

  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  legendaPonto: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendaTexto: {
    ...TYPE.small,
    color: COLORS.textSecondary,
    fontVariant: ["tabular-nums"],
  },

  divisor: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 22,
    marginBottom: 18,
    opacity: 0.7,
  },

  numeros: {
    flexDirection: "row",
    alignItems: "center",
  },

  numero: {
    flex: 1,
    alignItems: "flex-start",
  },

  numeroValor: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
    maxWidth: "100%",
  },

  numeroRotulo: {
    ...TYPE.small,
    marginTop: 2,
  },

  numeroLinha: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    marginHorizontal: 14,
    opacity: 0.7,
  },

  /* aviso */
  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.warningBackground,
    borderWidth: 1,
    borderColor: "rgba(245, 181, 68, 0.22)",
  },

  avisoIcone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(245, 181, 68, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  avisoTextos: {
    flex: 1,
  },

  avisoTitulo: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  avisoSub: {
    ...TYPE.caption,
    marginTop: 2,
  },

  /* botão */
  botaoPrincipal: {
    height: 58,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  botaoPrincipalTexto: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  /* seções */
  secao: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 14,
  },

  secaoTitulo: {
    ...TYPE.heading,
  },

  secaoAcao: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: "700",
  },

  /* movimentações */
  listaMov: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    paddingHorizontal: 14,
  },

  mov: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },

  movBorda: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  movIcone: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  movTextos: {
    flex: 1,
  },

  movNome: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },

  movQuando: {
    ...TYPE.caption,
    fontSize: 12,
    marginTop: 2,
  },

  movQtd: {
    fontSize: 17,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  semMov: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
  },

  semMovTexto: {
    ...TYPE.caption,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
