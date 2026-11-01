import { PALETAS, Paleta } from "./paletas";
import { esquemaAtual } from "./tema";
import { viva } from "./viva";

export type { Paleta } from "./paletas";

/**
 * Cores do tema que está valendo agora (claro ou escuro).
 * Os nomes das chaves são os mesmos de antes; os valores mudam com o tema.
 */
export const COLORS: Paleta = viva(() => PALETAS[esquemaAtual()]);
