import { describe, expect, it } from "vitest";
import { LIMITE_ESTOQUE_BAIXO, statusDoEstoque } from "../regrasEstoque";

describe("statusDoEstoque", () => {
  it("zero ou negativo é zerado", () => {
    expect(statusDoEstoque(0)).toBe("zerado");
    expect(statusDoEstoque(-2)).toBe("zerado");
  });

  it("de 1 até o limite é baixo", () => {
    expect(statusDoEstoque(1)).toBe("baixo");
    expect(statusDoEstoque(LIMITE_ESTOQUE_BAIXO)).toBe("baixo");
  });

  it("acima do limite está em dia", () => {
    expect(statusDoEstoque(LIMITE_ESTOQUE_BAIXO + 1)).toBe("ok");
    expect(statusDoEstoque(100)).toBe("ok");
  });
});
