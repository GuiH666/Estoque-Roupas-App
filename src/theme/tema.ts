import { Appearance } from "react-native";
import Storage from "expo-sqlite/kv-store";

import type { Esquema } from "./paletas";

export type Preferencia = "sistema" | Esquema;

const CHAVE = "tema";

/** Lê a escolha salva (ou "sistema", se nunca escolheu). */
export function lerPreferencia(): Preferencia {
  try {
    const valor = Storage.getItemSync(CHAVE);
    if (valor === "claro" || valor === "escuro" || valor === "sistema") {
      return valor;
    }
  } catch {
    // sem armazenamento: segue o sistema
  }
  return "sistema";
}

export function salvarPreferencia(preferencia: Preferencia) {
  try {
    Storage.setItemSync(CHAVE, preferencia);
  } catch {
    // a escolha vale só até fechar o app
  }
}

/** Transforma a preferência em um esquema de verdade (claro ou escuro). */
export function resolver(preferencia: Preferencia): Esquema {
  if (preferencia === "sistema") {
    return Appearance.getColorScheme() === "light" ? "claro" : "escuro";
  }
  return preferencia;
}

/*
 * Esquema que está valendo agora. É lido na hora em que cada cor é pedida,
 * por isso precisa estar certo ANTES do primeiro desenho da tela.
 */
let atual: Esquema = resolver(lerPreferencia());

export function esquemaAtual(): Esquema {
  return atual;
}

export function definirEsquema(esquema: Esquema) {
  atual = esquema;
}
