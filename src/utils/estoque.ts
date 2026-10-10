import { COLORS } from "../theme/colors";

/** Até esta quantidade o produto é considerado com estoque baixo. */
export const LIMITE_ESTOQUE_BAIXO = 3;

export type StatusEstoque = "ok" | "baixo" | "zerado";

export function statusDoEstoque(quantidade: number): StatusEstoque {
  if (quantidade <= 0) return "zerado";
  if (quantidade <= LIMITE_ESTOQUE_BAIXO) return "baixo";
  return "ok";
}

export const STATUS_INFO: Record<
  StatusEstoque,
  { rotulo: string; cor: string; fundo: string }
> = {
  ok: {
    rotulo: "Em dia",
    cor: COLORS.success,
    fundo: COLORS.successBackground,
  },
  baixo: {
    rotulo: "Baixo",
    cor: COLORS.warning,
    fundo: COLORS.warningBackground,
  },
  zerado: {
    rotulo: "Zerado",
    cor: COLORS.danger,
    fundo: COLORS.dangerBackground,
  },
};
