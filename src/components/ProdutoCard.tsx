import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Produto } from "../types/Produto";

type Props = {
  produto: Produto;
};

export default function ProdutoCard({
  produto,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.nome}>
        {produto.nome}
      </Text>

      <Text style={styles.info}>
        Tamanho: {produto.tamanho || "-"}
      </Text>

      <Text style={styles.info}>
        Cor: {produto.cor || "-"}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.quantidade}>
          Qtd: {produto.quantidade}
        </Text>

        <Text style={styles.preco}>
          R$ {produto.preco.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  nome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  info: {
    color: "#666",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  quantidade: {
    fontWeight: "bold",
    color: "#27AE60",
  },

  preco: {
    fontWeight: "bold",
  },
});