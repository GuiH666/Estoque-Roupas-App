/**
 * Formatadores simples, sem depender de Intl
 * (assim funcionam igual em qualquer dispositivo).
 */

/** 12345.6 -> "12.345,60" */
export function formatarNumeroBR(valor: number, casas = 2): string {
  const seguro = Number.isFinite(valor) ? valor : 0;
  const [inteiro, decimal] = Math.abs(seguro).toFixed(casas).split(".");
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sinal = seguro < 0 ? "-" : "";
  return decimal ? `${sinal}${comMilhar},${decimal}` : `${sinal}${comMilhar}`;
}

/** 12345.6 -> "R$ 12.345,60" */
export function formatarMoeda(valor: number): string {
  return `R$ ${formatarNumeroBR(valor, 2)}`;
}

/** 1500 -> "1.500" */
export function formatarInteiro(valor: number): string {
  return formatarNumeroBR(Math.round(valor), 0);
}

/** Converte "7990" (centavos digitados) em 79.9 */
export function centavosParaNumero(digitos: string): number {
  const limpo = digitos.replace(/\D/g, "");
  if (!limpo) return 0;
  return Number(limpo) / 100;
}

/** Converte 79.9 em "7990" (centavos como texto) */
export function numeroParaCentavos(valor: number): string {
  if (!Number.isFinite(valor) || valor <= 0) return "";
  return String(Math.round(valor * 100));
}

/** "7990" -> "79,90" (para mostrar dentro do campo de preço) */
export function mascararCentavos(digitos: string): string {
  if (!digitos) return "";
  return formatarNumeroBR(centavosParaNumero(digitos), 2);
}

const DIAS_SEMANA = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

const DIAS_CURTOS = ["D", "S", "T", "Q", "Q", "S", "S"];

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function saudacao(data = new Date()): string {
  const hora = data.getHours();
  if (hora < 5) return "Boa madrugada";
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

/** "sexta-feira, 9 de outubro" */
export function dataPorExtenso(data = new Date()): string {
  return `${DIAS_SEMANA[data.getDay()]}, ${data.getDate()} de ${
    MESES[data.getMonth()]
  }`;
}

export function inicialDoDia(data: Date): string {
  return DIAS_CURTOS[data.getDay()];
}

function doisDigitos(n: number) {
  return String(n).padStart(2, "0");
}

export function chaveDoDia(data: Date): string {
  return `${doisDigitos(data.getDate())}/${doisDigitos(
    data.getMonth() + 1
  )}/${data.getFullYear()}`;
}

export type DataMovimentacao = {
  /** "09/10/2026" */
  dia: string;
  /** "22:15" (vazio se não for possível ler) */
  hora: string;
  /** Objeto Date do dia (sem hora) ou null */
  data: Date | null;
};

/**
 * As movimentações guardam a data como texto (toLocaleString("pt-BR")),
 * por exemplo "09/10/2026 22:15:03" ou "09/10/2026, 22:15:03".
 * Esta função lê os dois formatos.
 */
export function lerDataMovimentacao(texto: string): DataMovimentacao {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]*(\d{1,2}:\d{2})?/.exec(
    texto || ""
  );

  if (!m) {
    return { dia: texto || "Sem data", hora: "", data: null };
  }

  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const data = new Date(ano, mes - 1, dia);

  return {
    dia: `${doisDigitos(dia)}/${doisDigitos(mes)}/${ano}`,
    hora: m[4] ? m[4].padStart(5, "0") : "",
    data,
  };
}

/** "Hoje", "Ontem" ou "quinta-feira, 8 de outubro" */
export function rotuloDoDia(info: DataMovimentacao, hoje = new Date()): string {
  if (!info.data) return info.dia;

  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (info.dia === chaveDoDia(hoje)) return "Hoje";
  if (info.dia === chaveDoDia(ontem)) return "Ontem";

  const base = `${DIAS_SEMANA[info.data.getDay()]}, ${info.data.getDate()} de ${
    MESES[info.data.getMonth()]
  }`;

  return info.data.getFullYear() === hoje.getFullYear()
    ? base
    : `${base} de ${info.data.getFullYear()}`;
}
