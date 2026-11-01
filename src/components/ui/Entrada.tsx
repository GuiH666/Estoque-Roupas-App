import React, { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from "react-native";

type Props = {
  children: React.ReactNode;
  /** Espera antes de aparecer (ms). Use degraus pequenos para escalonar blocos. */
  atraso?: number;
  /** De quantos pixels abaixo o bloco sobe até o lugar */
  distancia?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Faz o bloco aparecer subindo de leve, uma única vez, quando entra na tela.
 * Com "reduzir movimento" ligado no sistema, aparece direto, sem animação.
 */
export default function Entrada({
  children,
  atraso = 0,
  distancia = 14,
  style,
}: Props) {
  const progresso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelado = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduzir) => {
        if (cancelado) return;

        if (reduzir) {
          progresso.setValue(1);
          return;
        }

        Animated.timing(progresso, {
          toValue: 1,
          duration: 420,
          delay: atraso,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      })
      .catch(() => progresso.setValue(1));

    return () => {
      cancelado = true;
    };
  }, [progresso, atraso]);

  return (
    <Animated.View
      style={[
        {
          opacity: progresso,
          transform: [
            {
              translateY: progresso.interpolate({
                inputRange: [0, 1],
                outputRange: [distancia, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
