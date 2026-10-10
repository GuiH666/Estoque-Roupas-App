import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../theme/colors";
import { LIFT } from "../../theme/tokens";

type Tipo = "sucesso" | "erro";

/**
 * Aviso rápido que aparece e some sozinho.
 *
 *   const { toast, mostrar } = useToast();
 *   ...
 *   mostrar("Camiseta cadastrada");
 *   ...
 *   return <View>{...}{toast}</View>
 */
export function useToast(bottom = 110) {
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState<Tipo>("sucesso");
  const opacidade = useRef(new Animated.Value(0)).current;
  const deslocamento = useRef(new Animated.Value(16)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const mostrar = useCallback(
    (texto: string, tipoAviso: Tipo = "sucesso") => {
      if (timer.current) clearTimeout(timer.current);

      setMensagem(texto);
      setTipo(tipoAviso);

      Animated.parallel([
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(deslocamento, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 6,
        }),
      ]).start();

      timer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacidade, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(deslocamento, {
            toValue: 16,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2200);
    },
    [opacidade, deslocamento]
  );

  const toast = (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.area,
        { bottom, opacity: opacidade, transform: [{ translateY: deslocamento }] },
      ]}
    >
      <View style={[styles.toast, LIFT]}>
        <Ionicons
          name={tipo === "sucesso" ? "checkmark-circle" : "alert-circle"}
          size={20}
          color={tipo === "sucesso" ? COLORS.success : COLORS.danger}
        />
        <Text style={styles.texto} numberOfLines={2}>
          {mensagem}
        </Text>
      </View>
    </Animated.View>
  );

  return { toast, mostrar };
}

const styles = StyleSheet.create({
  area: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
  },

  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    maxWidth: 420,
  },

  texto: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
});
