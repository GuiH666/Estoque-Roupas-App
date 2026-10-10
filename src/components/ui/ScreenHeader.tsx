import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../../theme/colors";
import { GUTTER, TYPE } from "../../theme/tokens";

type Props = {
  titulo: string;
  subtitulo?: string;
  /** Texto pequeno acima do título (ex.: "Boa noite") */
  acima?: string;
  /** Elemento à direita (botão, ícone...) */
  direita?: React.ReactNode;
};

/**
 * Cabeçalho padrão das telas, já respeitando a área segura do topo
 * (notch / barra de status).
 */
export default function ScreenHeader({
  titulo,
  subtitulo,
  acima,
  direita,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 14 }]}>
      <View style={styles.textos}>
        {acima ? <Text style={styles.acima}>{acima}</Text> : null}

        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>

        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      </View>

      {direita ? <View style={styles.direita}>{direita}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingBottom: 18,
  },

  textos: {
    flex: 1,
    paddingRight: 12,
  },

  acima: {
    ...TYPE.caption,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  titulo: {
    ...TYPE.title,
  },

  subtitulo: {
    ...TYPE.caption,
    marginTop: 4,
  },

  direita: {
    paddingBottom: 4,
  },
});
