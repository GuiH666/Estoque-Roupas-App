import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { COLORS } from "../../theme/colors";

type Props = {
  /** Raio dos cantos da costura (normalmente o raio do cartão menos o inset) */
  raio?: number;
  /** Distância da borda do cartão */
  inset?: number;
  cor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Pontos de costura (como o pesponto do jeans).
 * É o detalhe de identidade do app: aparece nos cartões principais,
 * nas etiquetas dos produtos e nos estados vazios.
 * Fica por cima do cartão e não captura toques.
 */
export default function Costura({
  raio = 20,
  inset = 7,
  cor = COLORS.threadSoft,
  style,
}: Props) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.costura,
        {
          top: inset,
          left: inset,
          right: inset,
          bottom: inset,
          borderRadius: raio,
          borderColor: cor,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  costura: {
    position: "absolute",
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
});
