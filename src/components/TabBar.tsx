import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PressableScale from "./ui/PressableScale";
import { COLORS } from "../theme/colors";
import { GLOW } from "../theme/tokens";
import { haptics } from "../utils/haptics";

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
        <View style={[styles.indicador, ativa && styles.indicadorAtivo]} />

        <Ionicons
          name={ativa ? aba.iconeAtivo : aba.icone}
          size={23}
          color={ativa ? COLORS.primaryLight : COLORS.textMuted}
        />

        <Text style={[styles.rotulo, ativa && styles.rotuloAtivo]}>
          {aba.rotulo}
        </Text>
      </PressableScale>
    );
  }

  return (
    <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {renderAba(ABAS[0])}
      {renderAba(ABAS[1])}

      <View style={styles.centro}>
        <PressableScale
          escala={0.9}
          style={[styles.botaoCentral, GLOW]}
          accessibilityRole="button"
          accessibilityLabel="Cadastrar novo produto"
          onPress={() => {
            haptics.medio();
            router.push("/produto");
          }}
        >
          <Ionicons name="add" size={30} color={COLORS.white} />
        </PressableScale>
      </View>

      {renderAba(ABAS[2])}
      {renderAba(ABAS[3])}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    paddingTop: 6,
    paddingHorizontal: 6,
  },

  aba: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 56,
    gap: 3,
  },

  indicador: {
    position: "absolute",
    top: 0,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
  },

  indicadorAtivo: {
    backgroundColor: COLORS.thread,
  },

  rotulo: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
  },

  rotuloAtivo: {
    color: COLORS.primaryLight,
  },

  centro: {
    width: 76,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoCentral: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
