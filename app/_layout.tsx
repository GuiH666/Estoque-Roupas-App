import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { COLORS } from "../src/theme/colors";
import { TemaProvider, useTema } from "../src/theme/TemaProvider";

export const unstable_settings = {
  anchor: "(tabs)",
};

/** Tema de navegação alinhado com as cores do app (evita "piscar" de outra cor). */
function temaDeNavegacao() {
  const base = COLORS.esquema === "escuro" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.borderSoft,
      notification: COLORS.thread,
    },
  };
}

function Navegacao() {
  const { esquema } = useTema();

  return (
    <ThemeProvider value={temaDeNavegacao()}>
      {/*
        A chave faz as telas serem recriadas quando o tema muda,
        e assim todas leem as cores do tema novo.
      */}
      <Stack
        key={esquema}
        screenOptions={{
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Cadastro e edição de produto: abre como folha por cima das abas */}
        <Stack.Screen
          name="produto"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>

      <StatusBar style={COLORS.statusBar} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <TemaProvider>
      <Navegacao />
    </TemaProvider>
  );
}
