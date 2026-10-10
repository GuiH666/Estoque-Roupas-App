import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import { COLORS } from "../../theme/colors";

type Props = {
  /** Valor de 0 a 1 */
  proporcao: number;
  cor?: string;
  altura?: number;
  /** Atraso em ms (para as barras entrarem em sequência) */
  atraso?: number;
};

/**
 * Barra de progresso que cresce ao aparecer.
 * Respeita a opção "reduzir movimento" do aparelho.
 */
export default function AnimatedBar({
  proporcao,
  cor = COLORS.primary,
  altura = 8,
  atraso = 0,
}: Props) {
  const alvo = Math.max(0, Math.min(1, proporcao));
  const valor = useRef(new Animated.Value(0)).current;
  const [reduzir, setReduzir] = useState(false);

  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => ativo && setReduzir(!!r))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (reduzir) {
      valor.setValue(alvo);
      return;
    }

    Animated.timing(valor, {
      toValue: alvo,
      duration: 650,
      delay: atraso,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [alvo, atraso, reduzir, valor]);

  const largura = valor.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[styles.fundo, { height: altura, borderRadius: altura / 2 }]}
    >
      <Animated.View
        style={{
          width: largura,
          height: altura,
          borderRadius: altura / 2,
          backgroundColor: cor,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: {
    backgroundColor: COLORS.surfaceRaised,
    overflow: "hidden",
  },
});
