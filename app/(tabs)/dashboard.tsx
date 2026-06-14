import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";

import { useFocusEffect } from "expo-router";

import { criarTabela } from "../../src/database/database";

import {
  calcularResumoEstoque,
  calcularEstatisticasAvancadas,
} from "../../src/services/produtoService";

import { Produto } from "../../src/types/Produto";

export default function DashboardScreen() {
  const [resumo, setResumo] =
    useState({
      totalProdutos: 0,
      totalPecas: 0,
      valorTotal: 0,
      estoqueBaixo: 0,
    });

  const [categoriaMaisEstoque,
    setCategoriaMaisEstoque] =
    useState("");

  const [topProdutos,
    setTopProdutos] =
    useState<Produto[]>([]);

  useFocusEffect(
    useCallback(() => {
      criarTabela();

      setResumo(
        calcularResumoEstoque()
      );

      const stats =
        calcularEstatisticasAvancadas();

      setCategoriaMaisEstoque(
        stats.categoriaMaisEstoque
      );

      setTopProdutos(
        stats.topProdutos
      );
    }, [])
  );

  return (
    <FlatList
      style={styles.container}
      data={topProdutos}
      keyExtractor={(item) =>
        String(item.id)
      }
      ListHeaderComponent={
        <>
          <Text style={styles.titulo}>
            📊 Dashboard
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>
              Produtos cadastrados
            </Text>

            <Text style={styles.valor}>
              {resumo.totalProdutos}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>
              Total de peças
            </Text>

            <Text style={styles.valor}>
              {resumo.totalPecas}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>
              Valor total do estoque
            </Text>

            <Text style={styles.valor}>
              R$
              {" "}
              {resumo.valorTotal.toFixed(
                2
              )}
            </Text>
          </View>

          <View
            style={
              styles.cardAlerta
            }
          >
            <Text style={styles.label}>
              Estoque baixo
            </Text>

            <Text style={styles.valor}>
              {
                resumo.estoqueBaixo
              }
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>
              Categoria com mais
              peças
            </Text>

            <Text style={styles.valor}>
              {
                categoriaMaisEstoque
              }
            </Text>
          </View>

          <Text style={styles.subtitulo}>
            🔥 Top Produtos
          </Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.cardProduto}>
          <Text style={styles.nome}>
            {item.nome}
          </Text>

          <Text>
            Categoria:
            {" "}
            {item.categoria}
          </Text>

          <Text>
            Quantidade:
            {" "}
            {item.quantidade}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor:
      "#F4F6F8",
    marginTop: 45,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  subtitulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 15,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },

  cardAlerta: {
    backgroundColor:
      "#FFE8E8",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    color: "#555",
  },

  valor: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 8,
  },

  cardProduto: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
  },
});