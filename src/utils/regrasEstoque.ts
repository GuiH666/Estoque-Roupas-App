/*
 * Regra do estoque, separada das cores para poder ser testada sem React Native.
 */

/** Até esta quantidade o produto é considerado com estoque baixo. */
export const LIMITE_ESTOQUE_BAIXO = 3;

export type StatusEstoque = "ok" | "baixo" | "zerado";

export function statusDoEstoque(quantidade: number): StatusEstoque {
  if (quantidade <= 0) return "zerado";
  if (quantidade <= LIMITE_ESTOQUE_BAIXO) return "baixo";
  return "ok";
}
