import React, { useRef } from "react";
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style"> & {
  style?: StyleProp<ViewStyle>;
  /** Escala ao pressionar (0.97 = encolhe 3%) */
  escala?: number;
};

/**
 * Botão que "afunda" levemente ao toque.
 * É o que dá a sensação de app nativo bem acabado.
 */
export default function PressableScale({
  style,
  escala = 0.97,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const valor = useRef(new Animated.Value(1)).current;

  function animar(para: number) {
    Animated.spring(valor, {
      toValue: para,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e: GestureResponderEvent) => {
        animar(escala);
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        animar(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale: valor }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}
