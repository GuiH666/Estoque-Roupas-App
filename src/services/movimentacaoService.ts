import { Movimentacao } from "../types/Movimentacao";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("estoque.db");

export function registrarMovimentacao(
  movimentacao: Movimentacao
) {
  db.runSync(
    `
    INSERT INTO movimentacoes
    (
      produtoId,
      nomeProduto,
      tipo,
      quantidade,
      data
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      movimentacao.produtoId,
      movimentacao.nomeProduto,
      movimentacao.tipo,
      movimentacao.quantidade,
      movimentacao.data,
    ]
  );
}

export function listarMovimentacoes() {
  return db.getAllSync(
    `
    SELECT *
    FROM movimentacoes
    ORDER BY id DESC
    `
  );
}