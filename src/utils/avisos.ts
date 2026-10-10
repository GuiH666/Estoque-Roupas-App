/**
 * Recado entre telas.
 *
 * Quando o cadastro fecha, a tela de baixo (Início ou Estoque) precisa
 * saber o que aconteceu para mostrar "Camiseta cadastrada".
 * A tela do cadastro deixa o recado aqui e a outra tela lê ao voltar.
 */
let recado: string | null = null;

export const avisos = {
  definir(mensagem: string) {
    recado = mensagem;
  },

  /** Devolve o recado pendente (uma única vez) e limpa. */
  consumir(): string | null {
    const atual = recado;
    recado = null;
    return atual;
  },
};
