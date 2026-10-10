import React, { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { COLORS } from "../../theme/colors";

type Props = TextInputProps & {
  rotulo: string;
  /** Texto cinza ao lado do rótulo (ex.: "opcional") */
  dica?: string;
  erro?: string;
  /** Texto fixo antes do valor (ex.: "R$") */
  prefixo?: string;
  /** Altura maior e fonte maior, para o campo principal */
  grande?: boolean;
  /** Algo à direita do rótulo (ex.: contador) */
  direita?: React.ReactNode;
};

/**
 * Campo de texto com rótulo, estado de foco e mensagem de erro.
 * O rótulo fica sempre visível (nada de placeholder fazendo papel de título).
 */
const Field = forwardRef<TextInput, Props>(function Field(
  { rotulo, dica, erro, prefixo, grande, direita, onFocus, onBlur, style, ...rest },
  ref
) {
  const [focado, setFocado] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.linhaRotulo}>
        <Text style={styles.rotulo}>
          {rotulo}
          {dica ? <Text style={styles.dica}>  {dica}</Text> : null}
        </Text>
        {direita}
      </View>

      <View
        style={[
          styles.caixa,
          grande && styles.caixaGrande,
          focado && styles.caixaFocada,
          !!erro && styles.caixaErro,
        ]}
      >
        {prefixo ? (
          <Text style={[styles.prefixo, grande && styles.prefixoGrande]}>
            {prefixo}
          </Text>
        ) : null}

        <TextInput
          ref={ref}
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.primaryLight}
          cursorColor={COLORS.primaryLight}
          accessibilityLabel={rotulo}
          {...rest}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          style={[styles.input, grande && styles.inputGrande, style]}
        />
      </View>

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
});

export default Field;

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },

  linhaRotulo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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

  caixa: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },

  caixaGrande: {
    height: 62,
    borderRadius: 16,
  },

  caixaFocada: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceSecondary,
  },

  caixaErro: {
    borderColor: COLORS.danger,
  },

  prefixo: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  prefixoGrande: {
    fontSize: 19,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
  },

  inputGrande: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  erro: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
});
