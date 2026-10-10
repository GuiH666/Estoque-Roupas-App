import React from "react";
import { Tabs } from "expo-router";

import TabBar from "../../src/components/TabBar";
import { COLORS } from "../../src/theme/colors";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.background },
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
