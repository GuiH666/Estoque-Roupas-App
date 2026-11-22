import { describe, expect, it } from "vitest";
import {
  centavosParaNumero,
  chaveDoDia,
  formatarInteiro,
  formatarMoeda,
  formatarNumeroBR,
  lerDataMovimentacao,
  mascararCentavos,
  numeroParaCentavos,
  rotuloDoDia,
  saudacao,
} from "../format";

describe("números e moeda", () => {
  it("usa ponto no milhar e vírgula no decimal", () => {
    expect(formatarNumeroBR(12345.6)).toBe("12.345,60");
    expect(formatarNumeroBR(0)).toBe("0,00");
    expect(formatarNumeroBR(-1500.5)).toBe("-1.500,50");
  });

  it("valor inválido vira zero em vez de NaN", () => {
    expect(formatarNumeroBR(NaN)).toBe("0,00");
    expect(formatarNumeroBR(Infinity)).toBe("0,00");
  });

  it("formata moeda e inteiro", () => {
    expect(formatarMoeda(79.9)).toBe("R$ 79,90");
    expect(formatarInteiro(1500)).toBe("1.500");
    expect(formatarInteiro(2.6)).toBe("3");
  });
});

describe("campo de preço em centavos", () => {
  it("converte os dígitos digitados em número", () => {
    expect(centavosParaNumero("7990")).toBe(79.9);
    expect(centavosParaNumero("")).toBe(0);
    expect(centavosParaNumero("R$ 12a")).toBe(0.12);
  });

  it("converte número em centavos e volta", () => {
    expect(numeroParaCentavos(79.9)).toBe("7990");
    expect(numeroParaCentavos(0)).toBe("");
    expect(numeroParaCentavos(-5)).toBe("");
    expect(numeroParaCentavos(NaN)).toBe("");
  });

  it("mostra a máscara dentro do campo", () => {
    expect(mascararCentavos("7990")).toBe("79,90");
    expect(mascararCentavos("5")).toBe("0,05");
    expect(mascararCentavos("")).toBe("");
  });
});

describe("datas das movimentações", () => {
  it("lê os dois formatos salvos pelo toLocaleString", () => {
    expect(lerDataMovimentacao("09/10/2026 22:15:03")).toMatchObject({
      dia: "09/10/2026",
      hora: "22:15",
    });
    expect(lerDataMovimentacao("9/1/2026, 8:05:00")).toMatchObject({
      dia: "09/01/2026",
      hora: "08:05",
    });
  });

  it("texto sem data não quebra", () => {
    expect(lerDataMovimentacao("")).toEqual({ dia: "Sem data", hora: "", data: null });
    expect(lerDataMovimentacao("ontem").data).toBeNull();
  });

  it("rótulo do dia: Hoje, Ontem e data por extenso", () => {
    const hoje = new Date(2026, 9, 9, 12); // sexta, 9/10/2026
    expect(chaveDoDia(hoje)).toBe("09/10/2026");
    expect(rotuloDoDia(lerDataMovimentacao("09/10/2026 10:00"), hoje)).toBe("Hoje");
    expect(rotuloDoDia(lerDataMovimentacao("08/10/2026 10:00"), hoje)).toBe("Ontem");
    expect(rotuloDoDia(lerDataMovimentacao("07/10/2026 10:00"), hoje)).toBe(
      "Quarta-feira, 7 de outubro"
    );
    expect(rotuloDoDia(lerDataMovimentacao("07/10/2025 10:00"), hoje)).toBe(
      "Terça-feira, 7 de outubro de 2025"
    );
  });
});

describe("saudacao", () => {
  it("muda conforme a hora", () => {
    expect(saudacao(new Date(2026, 9, 9, 3))).toBe("Boa madrugada");
    expect(saudacao(new Date(2026, 9, 9, 9))).toBe("Bom dia");
    expect(saudacao(new Date(2026, 9, 9, 14))).toBe("Boa tarde");
    expect(saudacao(new Date(2026, 9, 9, 21))).toBe("Boa noite");
  });
});
