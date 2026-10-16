import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { criarTabela } from "../../src/database/database";
import {
  adicionarEstoque,
  buscarProdutos,
  removerEstoque,
} from "../../src/services/produtoService";
import { Produto } from "../../src/types/Produto";

import ProdutoCard from "../../src/components/ProdutoCard";
import Chip from "../../src/components/ui/Chip";
import EmptyState from "../../src/components/ui/EmptyState";
import PressableScale from "../../src/components/ui/PressableScale";
import ScreenHeader from "../../src/components/ui/ScreenHeader";
import { useToast } from "../../src/components/ui/Toast";

import { COLORS } from "../../src/theme/colors";
import { GUTTER, TYPE } from "../../src/theme/tokens";
import { formatarInteiro } from "../../src/utils/format";
import { statusDoEstoque } from "../../src/utils/estoque";
import { avisos } from "../../src/utils/avisos";
import { haptics } from "../../src/utils/haptics";

const TODAS = "Todas";

export default function EstoqueScreen() {
  const router = useRouter();
  const { filtro, t } = useLocalSearchParams<{ filtro?: string; t?: string }>();
  const { toast, mostrar } = useToast(24);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(TODAS);
  const [soBaixo, setSoBaixo] = useState(false);

  const carregar = useCallback(() => {
    criarTabela();
    setProdutos(buscarProdutos());
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();

      const aviso = avisos.consumir();
      if (aviso) mostrar(aviso);
    }, [carregar, mostrar])
  );

  // Vindo do aviso da tela inicial: abre já filtrando o que está acabando
  useEffect(() => {
    if (filtro === "baixo") {
      setSoBaixo(true);
      setCategoriaSelecionada(TODAS);
      setPesquisa("");
    }
  }, [filtro, t]);

  /* ---------- Ações ---------- */

  function abrirCadastro() {
    router.push("/produto");
  }

  function editar(produto: Produto) {
    router.push({ pathname: "/produto", params: { id: String(produto.id) } });
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

  function limparFiltros() {
    setPesquisa("");
    setCategoriaSelecionada(TODAS);
    setSoBaixo(false);
  }

  /* ---------- Dados ---------- */

  const categorias = useMemo(() => {
    const encontradas = Array.from(
      new Set(produtos.map((p) => p.categoria || "Sem categoria"))
    ).sort((a, b) => a.localeCompare(b));

    return [TODAS, ...encontradas];
  }, [produtos]);

  const totalBaixo = useMemo(
    () => produtos.filter((p) => statusDoEstoque(p.quantidade) !== "ok").length,
    [produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const texto = pesquisa.trim().toLowerCase();

    return produtos.filter((produto) => {
      const combinaPesquisa =
        !texto ||
        produto.nome.toLowerCase().includes(texto) ||
        (produto.cor || "").toLowerCase().includes(texto) ||
        (produto.tamanho || "").toLowerCase().includes(texto) ||
        produto.categoria.toLowerCase().includes(texto);

      const combinaCategoria =
        categoriaSelecionada === TODAS ||
        (produto.categoria || "Sem categoria") === categoriaSelecionada;

      const combinaStatus =
        !soBaixo || statusDoEstoque(produto.quantidade) !== "ok";

      return combinaPesquisa && combinaCategoria && combinaStatus;
    });
  }, [produtos, pesquisa, categoriaSelecionada, soBaixo]);

  const sections = useMemo(() => {
    const grupos: Record<string, Produto[]> = {};

    produtosFiltrados.forEach((produto) => {
      const categoria = produto.categoria || "Sem categoria";
      if (!grupos[categoria]) grupos[categoria] = [];
      grupos[categoria].push(produto);
    });

    return Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({
        title,
        data,
        pecas: data.reduce((soma, p) => soma + p.quantidade, 0),
      }));
  }, [produtosFiltrados]);

  const totalPecas = useMemo(
    () => produtos.reduce((soma, p) => soma + p.quantidade, 0),
    [produtos]
  );

  const filtrando =
    pesquisa.trim().length > 0 || categoriaSelecionada !== TODAS || soBaixo;

  /* ---------- Tela ---------- */

  return (
    <View style={styles.tela}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              titulo="Estoque"
              subtitulo={
                produtos.length === 0
                  ? "Nenhum produto cadastrado"
                  : `${formatarInteiro(produtos.length)} ${
                      produtos.length === 1 ? "produto" : "produtos"
                    } e ${formatarInteiro(totalPecas)} ${
                      totalPecas === 1 ? "peça" : "peças"
                    }`
              }
            />

            {produtos.length > 0 ? (
              <>
                <View style={styles.pesquisaArea}>
                  <View style={styles.pesquisa}>
                    <Ionicons
                      name="search"
                      size={20}
                      color={COLORS.textMuted}
                    />

                    <TextInput
                      style={styles.pesquisaInput}
                      placeholder="Buscar produto, cor ou tamanho"
                      placeholderTextColor={COLORS.textMuted}
                      selectionColor={COLORS.primaryLight}
                      value={pesquisa}
                      onChangeText={setPesquisa}
                      returnKeyType="search"
                      autoCorrect={false}
                      accessibilityLabel="Buscar produtos"
                    />

                    {pesquisa.length > 0 ? (
                      <PressableScale
                        onPress={() => setPesquisa("")}
                        hitSlop={10}
                        escala={0.9}
                        accessibilityRole="button"
                        accessibilityLabel="Limpar busca"
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={COLORS.textMuted}
                        />
                      </PressableScale>
                    ) : null}
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  style={styles.chips}
                  contentContainerStyle={styles.chipsConteudo}
                >
                  <Chip
                    rotulo="Estoque baixo"
                    icone="alert-circle-outline"
                    contagem={totalBaixo}
                    ativo={soBaixo}
                    tom={COLORS.thread}
                    tomTexto="#2A1E05"
                    onPress={() => setSoBaixo((v) => !v)}
                  />

                  {categorias.map((categoria) => (
                    <Chip
                      key={categoria}
                      rotulo={categoria}
                      ativo={categoriaSelecionada === categoria}
                      onPress={() => {
                        Keyboard.dismiss();
                        setCategoriaSelecionada(categoria);
                      }}
                    />
                  ))}
                </ScrollView>

                {filtrando ? (
                  <View style={styles.resultado}>
                    <Text style={styles.resultadoTexto}>
                      {produtosFiltrados.length}{" "}
                      {produtosFiltrados.length === 1
                        ? "resultado"
                        : "resultados"}
                    </Text>

                    <PressableScale
                      onPress={limparFiltros}
                      hitSlop={10}
                      escala={0.94}
                      accessibilityRole="button"
                    >
                      <Text style={styles.resultadoLimpar}>Limpar filtros</Text>
                    </PressableScale>
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo} numberOfLines={1}>
              {section.title}
            </Text>

            <Text style={styles.secaoInfo}>
              {section.data.length}{" "}
              {section.data.length === 1 ? "produto" : "produtos"} •{" "}
              {formatarInteiro(section.pecas)}{" "}
              {section.pecas === 1 ? "peça" : "peças"}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ProdutoCard
              produto={item}
              onPress={() => editar(item)}
              onEntrada={() => entradaEstoque(item)}
              onSaida={() => saidaEstoque(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          produtos.length === 0 ? (
            <EmptyState
              icone="cube-outline"
              titulo="Nenhum produto ainda"
              texto="Cadastre suas peças para controlar quantidades e preços em um só lugar."
              acao="Cadastrar produto"
              onAcao={abrirCadastro}
            />
          ) : (
            <EmptyState
              icone="search-outline"
              titulo="Nada encontrado"
              texto="Nenhum produto combina com a busca ou os filtros escolhidos."
              acao="Limpar filtros"
              onAcao={limparFiltros}
            />
          )
        }
      />

      {toast}
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

  /* busca */
  pesquisaArea: {
    paddingHorizontal: GUTTER,
  },

  pesquisa: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  pesquisaInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 0,
  },

  /* filtros */
  chips: {
    marginTop: 14,
  },

  chipsConteudo: {
    paddingHorizontal: GUTTER,
    gap: 8,
  },

  resultado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    marginTop: 14,
  },

  resultadoTexto: {
    ...TYPE.caption,
    fontSize: 14,
  },

  resultadoLimpar: {
    color: COLORS.primaryLight,
    fontSize: 14,
    fontWeight: "700",
  },

  /* grupos */
  secao: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 22,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },

  secaoTitulo: {
    ...TYPE.heading,
    flexShrink: 1,
  },

  secaoInfo: {
    ...TYPE.small,
    fontVariant: ["tabular-nums"],
  },

  item: {
    paddingHorizontal: GUTTER,
  },
});
