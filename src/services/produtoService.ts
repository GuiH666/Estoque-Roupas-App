import { Produto } from "../types/Produto";

import {
  cadastrarProduto,
  listarProdutos,
  excluirProduto,
  editarProduto,
  atualizarQuantidade,
} from "../database/database";

import { registrarMovimentacao } from "./movimentacaoService";

export function salvarProduto(produto: Produto) {
  if (!produto.nome || !produto.categoria) {
    throw new Error("Nome e categoria são obrigatórios.");
  }

  if (produto.quantidade < 0) {
    throw new Error("A quantidade não pode ser negativa.");
  }

  if (produto.preco < 0) {
    throw new Error("O preço não pode ser negativo.");
  }

  if (produto.id) {
    editarProduto(produto);
  } else {
    cadastrarProduto(produto);
  }
}

export function buscarProdutos(): Produto[] {
  return listarProdutos();
}

export function removerProduto(id: number) {
  excluirProduto(id);
}

export function adicionarEstoque(produto: Produto) {
  atualizarQuantidade(produto.id!, 1);

  registrarMovimentacao({
    produtoId: produto.id!,
    nomeProduto: produto.nome,
    tipo: "entrada",
    quantidade: 1,
    data: new Date().toLocaleString("pt-BR"),
  });
}

export function removerEstoque(produto: Produto) {
  if (produto.quantidade <= 0) {
    throw new Error("Não é possível deixar o estoque negativo.");
  }

  atualizarQuantidade(produto.id!, -1);

  registrarMovimentacao({
    produtoId: produto.id!,
    nomeProduto: produto.nome,
    tipo: "saida",
    quantidade: 1,
    data: new Date().toLocaleString("pt-BR"),
  });
}
 export function calcularResumoEstoque() {
  const produtos: Produto[] = buscarProdutos();

  const totalProdutos = produtos.length;

  const totalPecas = produtos.reduce(
    (total, produto: Produto) =>
      total + produto.quantidade,
    0
  );

  const valorTotal = produtos.reduce(
    (total, produto: Produto) =>
      total +
      produto.quantidade * produto.preco,
    0
  );

  const estoqueBaixo = produtos.filter(
    (produto: Produto) =>
      produto.quantidade <= 3
  ).length;

  return {
    totalProdutos,
    totalPecas,
    valorTotal,
    estoqueBaixo,
  };
 }
  export function calcularEstatisticasAvancadas() {
  const produtos: Produto[] = buscarProdutos();

  const categoriaMap: Record<string, number> = {};

  produtos.forEach((produto) => {
    const categoria = produto.categoria || "Sem categoria";

    categoriaMap[categoria] =
      (categoriaMap[categoria] || 0) +
      produto.quantidade;
  });

  const categoriaMaisEstoque =
    Object.entries(categoriaMap).sort(
      (a, b) => b[1] - a[1]
    )[0];

  const topProdutos = [...produtos]
    .sort(
      (a, b) =>
        b.quantidade - a.quantidade
    )
    .slice(0, 5);

  return {
    categoriaMaisEstoque:
      categoriaMaisEstoque?.[0] ??
      "Nenhuma",

    topProdutos,
  };
}


