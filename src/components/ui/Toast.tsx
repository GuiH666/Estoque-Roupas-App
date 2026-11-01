import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../theme/colors";
import { lift } from "../../theme/tokens";
import { criarEstilos } from "../../theme/criarEstilos";

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
      <View
        style={[
          styles.toast,
          lift(),
          { backgroundColor: tipo === "sucesso" ? COLORS.primary : COLORS.danger },
        ]}
      >
        <Ionicons
          name={tipo === "sucesso" ? "checkmark-circle" : "alert-circle"}
          size={22}
          color={tipo === "sucesso" ? COLORS.onPrimary : COLORS.white}
        />
        <Text
          style={[
            styles.texto,
            { color: tipo === "sucesso" ? COLORS.onPrimary : COLORS.white },
          ]}
          numberOfLines={2}
        >
          {mensagem}
        </Text>
      </View>
    </Animated.View>
  );

  return { toast, mostrar };
}

const styles = criarEstilos(() => ({
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
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: 420,
  },

  texto: {
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 1,
  },
}));
