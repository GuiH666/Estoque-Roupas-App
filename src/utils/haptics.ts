import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Vibrações leves para dar sensação de toque.
 * Se o aparelho não suportar, simplesmente não faz nada.
 */
function seguro(acao: () => Promise<void>) {
  if (Platform.OS === "web") return;
  try {
    acao().catch(() => {});
  } catch {
    // sem háptico neste aparelho
  }
}

export const haptics = {
  toque: () => seguro(() => Haptics.selectionAsync()),
  leve: () =>
    seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medio: () =>
    seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  sucesso: () =>
    seguro(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    ),
  erro: () =>
    seguro(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    ),
};
