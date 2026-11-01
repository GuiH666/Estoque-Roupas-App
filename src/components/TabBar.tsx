import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PressableScale from "./ui/PressableScale";
import { COLORS } from "../theme/colors";
import { glow } from "../theme/tokens";
import { haptics } from "../utils/haptics";
import { criarEstilos } from "../theme/criarEstilos";

/*
 * O que a barra recebe do Expo Router (só o que ela usa).
 * Declarado aqui porque, a partir do SDK 56, o app não pode mais importar
 * de pacotes @react-navigation/* diretamente.
 */
type BottomTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: any;
};

type Aba = {
  nome: string;
  rotulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  iconeAtivo: keyof typeof Ionicons.glyphMap;
};

/** Ordem e aparência das abas. A que não estiver aqui fica escondida. */
const ABAS: Aba[] = [
  { nome: "index", rotulo: "Início", icone: "home-outline", iconeAtivo: "home" },
  { nome: "estoque", rotulo: "Estoque", icone: "cube-outline", iconeAtivo: "cube" },
  { nome: "historico", rotulo: "Histórico", icone: "time-outline", iconeAtivo: "time" },
  { nome: "dashboard", rotulo: "Dashboard", icone: "stats-chart-outline", iconeAtivo: "stats-chart" },
];

/**
 * Barra de abas própria: 2 abas, botão central de cadastro e 2 abas.
 * O botão do meio abre direto o cadastro de produto.
 */
export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const rotaAtiva = state.routes[state.index]?.name;

  function renderAba(aba: Aba) {
    const rota = state.routes.find((r) => r.name === aba.nome);
    if (!rota) return null;

    const ativa = rotaAtiva === aba.nome;

    return (
      <PressableScale
        key={aba.nome}
        escala={0.92}
        style={styles.aba}
        accessibilityRole="tab"
        accessibilityLabel={aba.rotulo}
        accessibilityState={{ selected: ativa }}
        onPress={() => {
          const evento = navigation.emit({
            type: "tabPress",
            target: rota.key,
            canPreventDefault: true,
          });

          if (!ativa && !evento.defaultPrevented) {
            haptics.toque();
            navigation.navigate(rota.name as never);
          }
        }}
        onLongPress={() =>
          navigation.emit({ type: "tabLongPress", target: rota.key })
        }
      >
        <View style={[styles.indicador, ativa && styles.indicadorAtivo]}>
          <Ionicons
            name={ativa ? aba.iconeAtivo : aba.icone}
            size={22}
            color={ativa ? COLORS.onPrimary : COLORS.textMuted}
          />
        </View>

        <Text style={[styles.rotulo, ativa && styles.rotuloAtivo]}>
          {aba.rotulo}
        </Text>
      </PressableScale>
    );
  }

  return (
    <View
      style={[styles.moldura, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
    <View style={styles.barra}>
      {renderAba(ABAS[0])}
      {renderAba(ABAS[1])}

      <View style={styles.centro}>
        <PressableScale
          escala={0.9}
          style={[styles.botaoCentral, glow()]}
          accessibilityRole="button"
          accessibilityLabel="Cadastrar novo produto"
          onPress={() => {
            haptics.medio();
            router.push("/produto");
          }}
        >
          <Ionicons name="add" size={32} color={COLORS.onPrimary} />
        </PressableScale>
      </View>

      {renderAba(ABAS[2])}
      {renderAba(ABAS[3])}
    </View>
    </View>
  );
}

const styles = criarEstilos(() => ({
  /* A barra flutua: uma cápsula com margem em volta, sobre o fundo da tela */
  moldura: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingTop: 8,
  },

  barra: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 34,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  aba: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    gap: 4,
  },

  /* Pílula atrás do ícone: acende na aba ativa */
  indicador: {
    width: 54,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  indicadorAtivo: {
    backgroundColor: COLORS.primary,
  },

  rotulo: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.1,
    color: COLORS.textMuted,
  },

  rotuloAtivo: {
    color: COLORS.text,
  },

  centro: {
    width: 70,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoCentral: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
}));
