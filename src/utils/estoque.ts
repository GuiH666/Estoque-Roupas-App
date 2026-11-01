import { COLORS } from "../theme/colors";

/** Até esta quantidade o produto é considerado com estoque baixo. */
export const LIMITE_ESTOQUE_BAIXO = 3;

export type StatusEstoque = "ok" | "baixo" | "zerado";

export function statusDoEstoque(quantidade: number): StatusEstoque {
  if (quantidade <= 0) return "zerado";
  if (quantidade <= LIMITE_ESTOQUE_BAIXO) return "baixo";
  return "ok";
}

/*
 * As cores são lidas na hora do uso (get), e não ao carregar o arquivo,
 * para acompanhar o tema claro ou escuro que estiver valendo.
 */
export const STATUS_INFO: Record<
  StatusEstoque,
  { rotulo: string; cor: string; fundo: string }
> = {
  ok: {
    rotulo: "Em dia",
    get cor() {
      return COLORS.success;
    },
    get fundo() {
      return COLORS.successBackground;
    },
  },
  baixo: {
    rotulo: "Baixo",
    get cor() {
      return COLORS.warning;
    },
    get fundo() {
      return COLORS.warningBackground;
    },
  },
  zerado: {
    rotulo: "Zerado",
    get cor() {
      return COLORS.danger;
    },
    get fundo() {
      return COLORS.dangerBackground;
    },
  },
};
