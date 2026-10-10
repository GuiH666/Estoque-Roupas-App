import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { COLORS } from "../src/theme/colors";

export const unstable_settings = {
  anchor: "(tabs)",
};

/** Tema de navegação alinhado com as cores do app (evita "piscar" branco). */
const TemaDoApp = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.borderSoft,
    notification: COLORS.thread,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={TemaDoApp}>
      <Stack
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

      <StatusBar style="light" />
    </ThemeProvider>
  );
}
