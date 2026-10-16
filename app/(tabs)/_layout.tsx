import React from "react";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TabBar from "../../src/components/TabBar";
import { COLORS } from "../../src/theme/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // O espaço do topo (relógio, bateria) fica reservado aqui, para o
        // conteúdo não passar por baixo da barra de status ao rolar.
        sceneStyle: {
          backgroundColor: COLORS.background,
          paddingTop: insets.top,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="estoque" options={{ title: "Estoque" }} />
      <Tabs.Screen name="historico" options={{ title: "Histórico" }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />

      {/* Sobra do modelo do Expo: continua escondida */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
