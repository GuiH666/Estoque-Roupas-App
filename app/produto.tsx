import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Produto } from "../src/types/Produto";
import { criarTabela } from "../src/database/database";
import {
  buscarProdutos,
  removerProduto,
  salvarProduto,
} from "../src/services/produtoService";

import { COLORS } from "../src/theme/colors";
import { GLOW, GUTTER, TYPE } from "../src/theme/tokens";
import {
  CATEGORIAS_SUGERIDAS,
  CORES_PRESET,
  TAMANHOS_PRESET,
  acharCorPreset,
  corEhClara,
} from "../src/utils/cores";
import {
  centavosParaNumero,
  formatarMoeda,
  mascararCentavos,
  numeroParaCentavos,
} from "../src/utils/format";
import { avisos } from "../src/utils/avisos";
import { haptics } from "../src/utils/haptics";

import EtiquetaPreview from "../src/components/EtiquetaPreview";
import Chip from "../src/components/ui/Chip";
import Field from "../src/components/ui/Field";
import PressableScale from "../src/components/ui/PressableScale";
import { useToast } from "../src/components/ui/Toast";

type CampoComErro = "nome" | "categoria" | "quantidade" | "preco";
type Erros = Partial<Record<CampoComErro, string>>;

const QUANTIDADE_MAXIMA = 999999;

export default function ProdutoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const idEditando = id ? Number(id) : null;
  const editando = idEditando !== null && Number.isFinite(idEditando);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [cor, setCor] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [precoCentavos, setPrecoCentavos] = useState("");

  const [outroTamanho, setOutroTamanho] = useState(false);
  const [outraCor, setOutraCor] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [erros, setErros] = useState<Erros>({});
  const [tecladoAberto, setTecladoAberto] = useState(false);

  const original = useRef<Produto | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const posicoes = useRef<Partial<Record<CampoComErro, number>>>({});

  const refNome = useRef<TextInput>(null);
  const refCategoria = useRef<TextInput>(null);

  const { toast, mostrar } = useToast(190);

  /* ---------- Carregamento ---------- */

  useEffect(() => {
    criarTabela();

    const lista = buscarProdutos();
    setProdutos(lista);

    if (editando) {
      const produto = lista.find((p) => p.id === idEditando);

      if (!produto) {
        router.back();
        return;
      }

      original.current = produto;
      setNome(produto.nome);
      setCategoria(produto.categoria);
      setTamanho(produto.tamanho || "");
      setCor(produto.cor || "");
      setQuantidade(String(produto.quantidade));
      setPrecoCentavos(numeroParaCentavos(produto.preco));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mostrarEvento =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const esconderEvento =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const a = Keyboard.addListener(mostrarEvento, () => setTecladoAberto(true));
    const b = Keyboard.addListener(esconderEvento, () =>
      setTecladoAberto(false)
    );

    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  /* ---------- Valores derivados ---------- */

  const quantidadeNumero = Number(quantidade || 0);
  const preco = centavosParaNumero(precoCentavos);

  const categoriasSugeridas = useMemo(() => {
    const contagem: Record<string, number> = {};
    produtos.forEach((p) => {
      const c = (p.categoria || "").trim();
      if (c) contagem[c] = (contagem[c] || 0) + 1;
    });

    const existentes = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .map(([c]) => c);

    const jaTem = new Set(existentes.map((c) => c.toLowerCase()));
    const extras = CATEGORIAS_SUGERIDAS.filter(
      (c) => !jaTem.has(c.toLowerCase())
    );

    return [...existentes, ...extras].slice(0, 12);
  }, [produtos]);

  const tamanhoPreset = TAMANHOS_PRESET.find(
    (t) => t.toLowerCase() === tamanho.trim().toLowerCase()
  );
  const corPreset = acharCorPreset(cor);

  const mostrarCampoTamanho =
    outroTamanho || (tamanho.trim().length > 0 && !tamanhoPreset);
  const mostrarCampoCor = outraCor || (cor.trim().length > 0 && !corPreset);

  const alterado = useMemo(() => {
    const base = original.current;

    if (editando && base) {
      return (
        nome.trim() !== base.nome ||
        categoria.trim() !== base.categoria ||
        tamanho.trim() !== (base.tamanho || "") ||
        cor.trim() !== (base.cor || "") ||
        quantidadeNumero !== base.quantidade ||
        Math.round(preco * 100) !== Math.round(base.preco * 100)
      );
    }

    return (
      nome.trim() !== "" ||
      categoria.trim() !== "" ||
      tamanho.trim() !== "" ||
      cor.trim() !== "" ||
      precoCentavos !== "" ||
      quantidade !== "1"
    );
  }, [
    editando,
    nome,
    categoria,
    tamanho,
    cor,
    quantidade,
    quantidadeNumero,
    precoCentavos,
    preco,
  ]);

  /* ---------- Ações ---------- */

  function limparErro(campo: CampoComErro) {
    setErros((atual) =>
      atual[campo] ? { ...atual, [campo]: undefined } : atual
    );
  }

  function fechar() {
    Keyboard.dismiss();

    if (!alterado) {
      router.back();
      return;
    }

    Alert.alert(
      "Descartar alterações?",
      editando
        ? "As mudanças feitas neste produto não serão salvas."
        : "As informações preenchidas serão perdidas.",
      [
        { text: "Continuar editando", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  }

  function mudarQuantidade(delta: number) {
    const nova = Math.max(
      0,
      Math.min(QUANTIDADE_MAXIMA, quantidadeNumero + delta)
    );
    haptics.leve();
    setQuantidade(String(nova));
    limparErro("quantidade");
  }

  function validar(): boolean {
    const novos: Erros = {};

    if (!nome.trim()) novos.nome = "Informe o nome da peça.";
    if (!categoria.trim()) {
      novos.categoria = "Escolha uma categoria ou digite uma nova.";
    }
    if (quantidade === "") {
      novos.quantidade = "Informe a quantidade. Pode ser 0.";
    }
    if (!precoCentavos || preco <= 0) {
      novos.preco = "Informe o preço de venda.";
    }

    setErros(novos);

    const ordem: CampoComErro[] = ["nome", "categoria", "quantidade", "preco"];
    const primeiro = ordem.find((c) => novos[c]);

    if (primeiro) {
      const y = posicoes.current[primeiro] ?? 0;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
      return false;
    }

    return true;
  }

  function montarProduto(): Produto {
    return {
      id: editando ? idEditando! : undefined,
      nome: nome.trim(),
      categoria: categoria.trim(),
      tamanho: tamanho.trim(),
      cor: cor.trim(),
      quantidade: quantidadeNumero,
      preco,
    };
  }

  function reiniciarParaOutro() {
    setNome("");
    setTamanho("");
    setCor("");
    setQuantidade("1");
    setPrecoCentavos("");
    setOutroTamanho(false);
    setOutraCor(false);
    setErros({});
    // a categoria fica: normalmente se cadastram várias peças parecidas em sequência

    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => refNome.current?.focus(), 350);
  }

  function salvar(adicionarOutro = false) {
    if (!validar()) {
      haptics.erro();
      return;
    }

    try {
      const produto = montarProduto();
      salvarProduto(produto);
      haptics.sucesso();

      if (adicionarOutro) {
        setProdutos(buscarProdutos());
        mostrar(`${produto.nome} cadastrado`);
        reiniciarParaOutro();
        return;
      }

      avisos.definir(
        editando ? "Alterações salvas" : `${produto.nome} cadastrado`
      );
      router.back();
    } catch (error: any) {
      haptics.erro();
      Alert.alert(
        "Não foi possível salvar",
        error?.message || "Ocorreu um erro inesperado. Tente novamente."
      );
    }
  }

  function excluir() {
    if (!editando) return;

    Alert.alert(
      "Excluir produto",
      `Excluir "${nome.trim() || "este produto"}"? Essa ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            removerProduto(idEditando!);
            haptics.sucesso();
            avisos.definir("Produto excluído");
            router.back();
          },
        },
      ]
    );
  }

  function guardarPosicao(campo: CampoComErro) {
    return (e: LayoutChangeEvent) => {
      posicoes.current[campo] = e.nativeEvent.layout.y;
    };
  }

  /* ---------- Tela ---------- */

  const topo = Platform.OS === "ios" ? 14 : insets.top + 8;

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Barra superior */}
      <View style={[styles.barra, { paddingTop: topo }]}>
        <PressableScale
          onPress={fechar}
          style={styles.botaoFechar}
          escala={0.92}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        >
          <Ionicons name="close" size={22} color={COLORS.text} />
        </PressableScale>

        <Text style={styles.barraTitulo}>
          {editando ? "Editar produto" : "Novo produto"}
        </Text>

        <View style={styles.botaoFechar} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        showsVerticalScrollIndicator={false}
      >
        {/* Prévia ao vivo */}
        <EtiquetaPreview
          nome={nome}
          categoria={categoria}
          tamanho={tamanho}
          cor={cor}
          quantidade={quantidadeNumero}
          preco={preco}
        />

        {/* Nome */}
        <View style={styles.secao} onLayout={guardarPosicao("nome")}>
          <Field
            ref={refNome}
            grande
            rotulo="Nome da peça"
            placeholder="Ex.: Camiseta básica algodão"
            value={nome}
            onChangeText={(t) => {
              setNome(t);
              limparErro("nome");
            }}
            erro={erros.nome}
            autoCapitalize="sentences"
            returnKeyType="next"
            onSubmitEditing={() => refCategoria.current?.focus()}
            maxLength={60}
          />
        </View>

        {/* Categoria */}
        <View style={styles.secao} onLayout={guardarPosicao("categoria")}>
          <Field
            ref={refCategoria}
            rotulo="Categoria"
            placeholder="Escolha abaixo ou digite"
            value={categoria}
            onChangeText={(t) => {
              setCategoria(t);
              limparErro("categoria");
            }}
            erro={erros.categoria}
            autoCapitalize="sentences"
            returnKeyType="done"
            maxLength={30}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.faixa}
            contentContainerStyle={styles.faixaConteudo}
          >
            {categoriasSugeridas.map((c) => (
              <Chip
                key={c}
                rotulo={c}
                ativo={categoria.trim().toLowerCase() === c.toLowerCase()}
                onPress={() => {
                  setCategoria(c);
                  limparErro("categoria");
                  Keyboard.dismiss();
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Tamanho */}
        <View style={styles.secao}>
          <Text style={styles.rotulo}>
            Tamanho <Text style={styles.dica}>opcional</Text>
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.faixa}
            contentContainerStyle={styles.faixaConteudo}
          >
            {TAMANHOS_PRESET.map((t) => (
              <Chip
                key={t}
                rotulo={t}
                ativo={tamanhoPreset === t}
                onPress={() => {
                  setOutroTamanho(false);
                  setTamanho(tamanhoPreset === t ? "" : t);
                }}
              />
            ))}

            <Chip
              rotulo="Outro"
              icone="create-outline"
              ativo={mostrarCampoTamanho}
              onPress={() => {
                if (mostrarCampoTamanho) {
                  setOutroTamanho(false);
                  if (!tamanhoPreset) setTamanho("");
                } else {
                  setOutroTamanho(true);
                  if (tamanhoPreset) setTamanho("");
                }
              }}
            />
          </ScrollView>

          {mostrarCampoTamanho ? (
            <View style={styles.campoExtra}>
              <Field
                rotulo="Outro tamanho"
                placeholder="Ex.: 3 anos, 100 cm"
                value={tamanho}
                onChangeText={setTamanho}
                maxLength={16}
                autoCapitalize="characters"
              />
            </View>
          ) : null}
        </View>

        {/* Cor */}
        <View style={styles.secao}>
          <Text style={styles.rotulo}>
            Cor <Text style={styles.dica}>opcional</Text>
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.faixa}
            contentContainerStyle={styles.faixaCores}
          >
            {CORES_PRESET.map((c) => {
              const ativa = corPreset?.nome === c.nome;

              return (
                <PressableScale
                  key={c.nome}
                  escala={0.92}
                  style={styles.amostraArea}
                  accessibilityRole="button"
                  accessibilityLabel={c.nome}
                  accessibilityState={{ selected: ativa }}
                  onPress={() => {
                    haptics.toque();
                    setOutraCor(false);
                    setCor(ativa ? "" : c.nome);
                  }}
                >
                  <View style={[styles.anel, ativa && styles.anelAtivo]}>
                    <View style={[styles.amostra, { backgroundColor: c.hex }]}>
                      {ativa ? (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={corEhClara(c.hex) ? "#101420" : COLORS.white}
                        />
                      ) : null}
                    </View>
                  </View>

                  <Text
                    style={[styles.amostraNome, ativa && styles.amostraNomeAtivo]}
                    numberOfLines={1}
                  >
                    {c.nome}
                  </Text>
                </PressableScale>
              );
            })}

            <PressableScale
              escala={0.92}
              style={styles.amostraArea}
              accessibilityRole="button"
              accessibilityLabel="Outra cor"
              accessibilityState={{ selected: mostrarCampoCor }}
              onPress={() => {
                haptics.toque();
                if (mostrarCampoCor) {
                  setOutraCor(false);
                  if (!corPreset) setCor("");
                } else {
                  setOutraCor(true);
                  if (corPreset) setCor("");
                }
              }}
            >
              <View style={[styles.anel, mostrarCampoCor && styles.anelAtivo]}>
                <View style={[styles.amostra, styles.amostraOutra]}>
                  <Ionicons
                    name={mostrarCampoCor ? "checkmark" : "add"}
                    size={20}
                    color={COLORS.thread}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.amostraNome,
                  mostrarCampoCor && styles.amostraNomeAtivo,
                ]}
              >
                Outra
              </Text>
            </PressableScale>
          </ScrollView>

          {mostrarCampoCor ? (
            <View style={styles.campoExtra}>
              <Field
                rotulo="Outra cor"
                placeholder="Ex.: Verde-musgo, Listrado"
                value={cor}
                onChangeText={setCor}
                maxLength={24}
                autoCapitalize="sentences"
              />
            </View>
          ) : null}
        </View>

        {/* Quantidade */}
        <View style={styles.secao} onLayout={guardarPosicao("quantidade")}>
          <Text style={styles.rotulo}>Quantidade em estoque</Text>

          <View
            style={[
              styles.stepper,
              !!erros.quantidade && styles.stepperErro,
            ]}
          >
            <PressableScale
              escala={0.9}
              style={[
                styles.stepperBotao,
                quantidadeNumero <= 0 && styles.stepperBotaoDesligado,
              ]}
              disabled={quantidadeNumero <= 0}
              onPress={() => mudarQuantidade(-1)}
              accessibilityRole="button"
              accessibilityLabel="Diminuir quantidade"
            >
              <Ionicons name="remove" size={26} color={COLORS.danger} />
            </PressableScale>

            <TextInput
              style={styles.stepperValor}
              value={quantidade}
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={6}
              selectionColor={COLORS.primaryLight}
              accessibilityLabel="Quantidade em estoque"
              onChangeText={(t) => {
                const digitos = t.replace(/\D/g, "").slice(0, 6);
                setQuantidade(digitos === "" ? "" : String(Number(digitos)));
                limparErro("quantidade");
              }}
            />

            <PressableScale
              escala={0.9}
              style={styles.stepperBotao}
              onPress={() => mudarQuantidade(1)}
              accessibilityRole="button"
              accessibilityLabel="Aumentar quantidade"
            >
              <Ionicons name="add" size={26} color={COLORS.success} />
            </PressableScale>
          </View>

          {erros.quantidade ? (
            <Text style={styles.erro}>{erros.quantidade}</Text>
          ) : null}
        </View>

        {/* Preço */}
        <View style={styles.secao} onLayout={guardarPosicao("preco")}>
          <Field
            grande
            rotulo="Preço de venda"
            prefixo="R$"
            placeholder="0,00"
            value={mascararCentavos(precoCentavos)}
            onChangeText={(t) => {
              const digitos = t
                .replace(/\D/g, "")
                .replace(/^0+/, "")
                .slice(0, 9);
              setPrecoCentavos(digitos);
              limparErro("preco");
            }}
            erro={erros.preco}
            keyboardType="number-pad"
            maxLength={14}
          />

          {quantidadeNumero > 0 && preco > 0 ? (
            <View style={styles.total}>
              <Ionicons name="calculator-outline" size={16} color={COLORS.thread} />
              <Text style={styles.totalTexto}>
                Valor desta peça em estoque:{" "}
                <Text style={styles.totalValor}>
                  {formatarMoeda(quantidadeNumero * preco)}
                </Text>
              </Text>
            </View>
          ) : null}
        </View>

        {editando ? (
          <PressableScale
            style={styles.botaoExcluir}
            onPress={excluir}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={19} color={COLORS.danger} />
            <Text style={styles.botaoExcluirTexto}>Excluir produto</Text>
          </PressableScale>
        ) : null}
      </ScrollView>

      {/* Rodapé fixo com as ações */}
      <View
        style={[
          styles.rodape,
          { paddingBottom: tecladoAberto ? 12 : Math.max(insets.bottom, 16) },
        ]}
      >
        <PressableScale
          style={[styles.botaoPrincipal, GLOW]}
          onPress={() => salvar(false)}
          accessibilityRole="button"
        >
          <Ionicons
            name={editando ? "checkmark-circle" : "add-circle"}
            size={22}
            color={COLORS.white}
          />
          <Text style={styles.botaoPrincipalTexto}>
            {editando ? "Salvar alterações" : "Cadastrar produto"}
          </Text>
        </PressableScale>

        {!editando && !tecladoAberto ? (
          <PressableScale
            style={styles.botaoSecundario}
            onPress={() => salvar(true)}
            accessibilityRole="button"
          >
            <Text style={styles.botaoSecundarioTexto}>
              Cadastrar e adicionar outro
            </Text>
          </PressableScale>
        ) : null}
      </View>

      {toast}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  /* barra superior */
  barra: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingBottom: 12,
  },

  botaoFechar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  barraTitulo: {
    ...TYPE.bodyStrong,
    fontSize: 17,
  },

  /* conteúdo */
  conteudo: {
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    paddingBottom: 36,
  },

  secao: {
    marginTop: 26,
  },

  rotulo: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },

  dica: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },

  /* Faixas horizontais que encostam nas bordas da tela */
  faixa: {
    marginTop: 12,
    marginHorizontal: -GUTTER,
  },

  faixaConteudo: {
    paddingHorizontal: GUTTER,
    gap: 8,
  },

  faixaCores: {
    paddingHorizontal: GUTTER,
    gap: 6,
  },

  campoExtra: {
    marginTop: 14,
  },

  /* amostras de cor */
  amostraArea: {
    width: 62,
    alignItems: "center",
    gap: 6,
  },

  anel: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  anelAtivo: {
    borderColor: COLORS.primary,
  },

  amostra: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  amostraOutra: {
    backgroundColor: COLORS.surface,
    borderStyle: "dashed",
    borderColor: COLORS.thread,
    borderWidth: 1.5,
  },

  amostraNome: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  amostraNomeAtivo: {
    color: COLORS.text,
    fontWeight: "800",
  },

  /* quantidade */
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    height: 66,
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 6,
  },

  stepperErro: {
    borderColor: COLORS.danger,
  },

  stepperBotao: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },

  stepperBotaoDesligado: {
    opacity: 0.35,
  },

  stepperValor: {
    flex: 1,
    textAlign: "center",
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
    paddingVertical: 0,
  },

  erro: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },

  /* total */
  total: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 2,
  },

  totalTexto: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },

  totalValor: {
    color: COLORS.thread,
    fontWeight: "800",
  },

  /* excluir */
  botaoExcluir: {
    marginTop: 34,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.dangerBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  botaoExcluirTexto: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "800",
  },

  /* rodapé */
  rodape: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  botaoPrincipal: {
    height: 58,
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

  botaoSecundario: {
    height: 46,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoSecundarioTexto: {
    color: COLORS.primaryLight,
    fontSize: 15,
    fontWeight: "700",
  },
});
