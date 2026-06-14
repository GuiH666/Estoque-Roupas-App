export type Movimentacao = {
  id?: number;
  produtoId: number;
  nomeProduto: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  data: string;
};