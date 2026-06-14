import { Produto } from "../types/Produto";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("estoque.db");

export function criarTabela() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      tamanho TEXT,
      cor TEXT,
      quantidade INTEGER NOT NULL,
      preco REAL NOT NULL
    );
  `);

  db.execSync(`
  CREATE TABLE IF NOT EXISTS movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produtoId INTEGER NOT NULL,
    nomeProduto TEXT NOT NULL,
    tipo TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    data TEXT NOT NULL
  );
`);
}

export function cadastrarProduto(produto: any) {
  db.runSync(
    `INSERT INTO produtos 
    (nome, categoria, tamanho, cor, quantidade, preco)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      produto.nome,
      produto.categoria,
      produto.tamanho,
      produto.cor,
      produto.quantidade,
      produto.preco,
    ]
  );
}

export function listarProdutos(): Produto[] {
  return db.getAllSync("SELECT * FROM produtos ORDER BY categoria, nome") as Produto[];
}

export function excluirProduto(id: number) {
  db.runSync("DELETE FROM produtos WHERE id = ?", [id]);
}

export function editarProduto(produto: any) {
  db.runSync(
    `UPDATE produtos 
     SET nome = ?, categoria = ?, tamanho = ?, cor = ?, quantidade = ?, preco = ?
     WHERE id = ?`,
    [
      produto.nome,
      produto.categoria,
      produto.tamanho,
      produto.cor,
      produto.quantidade,
      produto.preco,
      produto.id,
    ]
  );
}

export function atualizarQuantidade(id: number, quantidade: number) {
  db.runSync(
    "UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?",
    [quantidade, id]
  );
}