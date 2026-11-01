import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Text,
  TextProps,
} from "react-native";

type Props = TextProps & {
  valor: number;
  /** Como mostrar o número (ex.: formatarMoeda) */
  formato: (valor: number) => string;
  duracao?: number;
};

/**
 * Número que "conta" até o valor final, e continua de onde estava quando o
 * valor muda (ex.: ao dar entrada ou saída em um produto).
 * Leitores de tela recebem sempre o valor final, nunca os passos do meio.
 */
export default function ValorAnimado({
  valor,
  formato,
  duracao = 700,
  ...texto
}: Props) {
  const animado = useRef(new Animated.Value(0)).current;
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
    const id = animado.addListener(({ value }) => setExibido(value));
    return () => animado.removeListener(id);
  }, [animado]);

  useEffect(() => {
    let cancelado = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduzir) => {
        if (cancelado) return;

        if (reduzir) {
          animado.setValue(valor);
          return;
        }

        Animated.timing(animado, {
          toValue: valor,
          duration: duracao,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      })
      .catch(() => animado.setValue(valor));

    return () => {
      cancelado = true;
      animado.stopAnimation();
    };
  }, [valor, duracao, animado]);

  return (
    <Text {...texto} accessibilityLabel={formato(valor)}>
      {formato(exibido)}
    </Text>
  );
}
