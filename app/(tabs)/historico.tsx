import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";

import { useFocusEffect } from "expo-router";

import { criarTabela } from "../../src/database/database";
import { listarMovimentacoes } from "../../src/services/movimentacaoService";
import { Movimentacao } from "../../src/types/Movimentacao";

export default function HistoricoScreen() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  useFocusEffect(
    useCallback(() => {
      criarTabela();
      setMovimentacoes(listarMovimentacoes() as Movimentacao[]);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📋 Histórico</Text>

      <FlatList
        data={movimentacoes}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma movimentação registrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nome}>{item.nomeProduto}</Text>

            <Text
              style={[
                styles.tipo,
                item.tipo === "entrada" ? styles.entrada : styles.saida,
              ]}
            >
              {item.tipo === "entrada" ? "Entrada" : "Saída"} de estoque
            </Text>

            <Text>Quantidade: {item.quantidade}</Text>
            <Text>Data: {item.data}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    marginTop: 45,
    backgroundColor: "#F4F6F8",
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  vazio: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  tipo: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  entrada: {
    color: "#27AE60",
  },

  saida: {
    color: "#E74C3C",
  },
});