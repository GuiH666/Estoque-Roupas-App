import { COLORS } from "../theme/colors";
import type { StatusEstoque } from "./regrasEstoque";

// A regra mora em regrasEstoque.ts; é reexportada aqui para os imports antigos continuarem valendo.
export { LIMITE_ESTOQUE_BAIXO, statusDoEstoque } from "./regrasEstoque";
export type { StatusEstoque } from "./regrasEstoque";

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
