/**
 * Cores de roupa mais comuns. O nome é o que fica salvo no produto
 * (continua sendo texto livre no banco), e o hex serve só para
 * mostrar a bolinha de cor no app.
 */
export type CorPreset = { nome: string; hex: string };

export const CORES_PRESET: CorPreset[] = [
  { nome: "Preto", hex: "#15171C" },
  { nome: "Branco", hex: "#F5F6F8" },
  { nome: "Cinza", hex: "#8A909C" },
  { nome: "Azul", hex: "#3C6BE0" },
  { nome: "Marinho", hex: "#1B2A57" },
  { nome: "Verde", hex: "#2E9E6B" },
  { nome: "Vermelho", hex: "#D9374B" },
  { nome: "Rosa", hex: "#F08CB4" },
  { nome: "Amarelo", hex: "#F2C94C" },
  { nome: "Laranja", hex: "#EE8434" },
  { nome: "Roxo", hex: "#7F56D9" },
  { nome: "Bege", hex: "#D8C3A0" },
  { nome: "Marrom", hex: "#7A5237" },
];

function normalizar(texto: string) {
  const base = (texto || "").trim().toLowerCase();

  // Tira acentos (Único -> unico). Se o aparelho não suportar, só ignora.
  try {
    return base.normalize("NFD").replace(/[̀-ͯ]/g, "");
  } catch {
    return base;
  }
}

/** Devolve o preset que combina com o texto (ignora acento e maiúscula). */
export function acharCorPreset(nome?: string): CorPreset | undefined {
  const alvo = normalizar(nome || "");
  if (!alvo) return undefined;
  return CORES_PRESET.find((c) => normalizar(c.nome) === alvo);
}

/** Hex da cor para desenhar a bolinha, ou undefined se não for conhecida. */
export function corParaHex(nome?: string): string | undefined {
  return acharCorPreset(nome)?.hex;
}

/** true se a cor é clara (para escolher um ícone escuro por cima dela). */
export function corEhClara(hex: string): boolean {
  const limpo = hex.replace("#", "");
  const r = parseInt(limpo.substring(0, 2), 16);
  const g = parseInt(limpo.substring(2, 4), 16);
  const b = parseInt(limpo.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

/** Tamanhos mais comuns, na ordem em que aparecem no cadastro. */
export const TAMANHOS_PRESET = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "XG",
  "Único",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
];

/** Categorias sugeridas quando o usuário ainda não tem nenhuma. */
export const CATEGORIAS_SUGERIDAS = [
  "Camiseta",
  "Calça",
  "Vestido",
  "Bermuda",
  "Jaqueta",
  "Blusa",
  "Saia",
  "Acessório",
  "Calçado",
];
