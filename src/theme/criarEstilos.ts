import { StyleSheet } from "react-native";

import type { Esquema } from "./paletas";
import { esquemaAtual } from "./tema";

/**
 * Igual ao StyleSheet.create, mas refeito para cada tema.
 *
 * Em vez de receber o objeto pronto, recebe uma função que devolve os
 * estilos. Ela roda uma vez por tema (na primeira vez que ele é usado) e o
 * resultado fica guardado. Assim `styles.cartao` sempre aponta para o estilo
 * do tema que está valendo.
 */
export function criarEstilos<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>
>(fabrica: () => T | StyleSheet.NamedStyles<T>): T {
  const guardados: Partial<Record<Esquema, T>> = {};

  function doTema(): T {
    const esquema = esquemaAtual();
    let estilos = guardados[esquema];
    if (!estilos) {
      estilos = StyleSheet.create(fabrica()) as T;
      guardados[esquema] = estilos;
    }
    return estilos;
  }

  // Só a leitura (styles.cartao) é interceptada; cada estilo devolvido é um
  // objeto de verdade, criado pelo StyleSheet.create do React Native.
  return new Proxy({} as T, {
    get: (_alvo, chave) => (doTema() as any)[chave],
  });
}
