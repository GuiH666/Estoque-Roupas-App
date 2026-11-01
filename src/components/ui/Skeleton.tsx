import React, { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  DimensionValue,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { COLORS } from "../../theme/colors";

type SkeletonProps = {
  largura?: DimensionValue;
  altura?: number;
  raio?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Bloco que "respira" enquanto o conteúdo real ainda não chegou.
 * Respeita a opção "reduzir movimento" do sistema (fica parado).
 */
export function Skeleton({
  largura = "100%",
  altura = 16,
  raio = 10,
  style,
}: SkeletonProps) {
  const pulso = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let cancelado = false;
    let animacao: { start: () => void; stop: () => void } | null = null;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduzir) => {
        if (cancelado || reduzir) return;

        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(pulso, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulso, {
              toValue: 0.5,
              duration: 800,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        );
        animacao = loop;
        loop.start();
      })
      .catch(() => {});

    return () => {
      cancelado = true;
      animacao?.stop();
    };
  }, [pulso]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: largura,
          height: altura,
          borderRadius: raio,
          backgroundColor: COLORS.surfaceRaised,
          opacity: pulso,
        },
        style,
      ]}
    />
  );
}

/** Cartão inteiro ainda carregando (ex.: o cartão principal da tela inicial). */
export function SkeletonBloco({
  altura,
  raio = 24,
  style,
}: {
  altura: number;
  raio?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Skeleton
      altura={altura}
      raio={raio}
      style={[{ backgroundColor: COLORS.surface }, style]}
    />
  );
}

/** Linhas parecidas com o cartão de produto (etiqueta + 2 linhas + contador). */
export function SkeletonLista({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <View
      accessible
      accessibilityLabel="Carregando"
      accessibilityLiveRegion="polite"
      style={styles.lista}
    >
      {Array.from({ length: quantidade }).map((_, i) => (
        <View key={i} style={styles.linha}>
          <Skeleton largura={52} altura={52} raio={16} />

          <View style={styles.textos}>
            <Skeleton largura="62%" altura={16} />
            <Skeleton largura="40%" altura={12} style={styles.espaco} />
            <Skeleton largura="26%" altura={14} style={styles.espaco} />
          </View>

          <Skeleton largura={88} altura={38} raio={19} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: 12,
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 22,
    padding: 14,
  },

  textos: {
    flex: 1,
  },

  espaco: {
    marginTop: 8,
  },
});
