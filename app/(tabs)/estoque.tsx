import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { useFocusEffect } from "expo-router";

import { criarTabela } from "../../src/database/database";

import { buscarProdutos } from "../../src/services/produtoService";

import { Produto } from "../../src/types/Produto";

import ProdutoCard from "../../src/components/ProdutoCard"

export default function EstoqueScreen() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");

  useFocusEffect(
    useCallback(() => {
      criarTabela();
      setProdutos(buscarProdutos());
    }, [])
  );

  const categorias = useMemo(() => {
    return [
      "Todas",
      ...Array.from(
        new Set(produtos.map((p) => p.categoria || "Sem categoria"))
      ),
    ];
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const texto = pesquisa.toLowerCase();

      const combinaPesquisa =
        produto.nome.toLowerCase().includes(texto) ||
        (produto.cor || "").toLowerCase().includes(texto) ||
        (produto.tamanho || "").toLowerCase().includes(texto);

      const combinaCategoria =
        categoriaSelecionada === "Todas" ||
        produto.categoria === categoriaSelecionada;

      return combinaPesquisa && combinaCategoria;
    });
  }, [produtos, pesquisa, categoriaSelecionada]);

  const produtosPorCategoria = useMemo(() => {
    return produtosFiltrados.reduce((grupo: Record<string, Produto[]>, produto) => {
      const categoria = produto.categoria || "Sem categoria";

      if (!grupo[categoria]) {
        grupo[categoria] = [];
      }

      grupo[categoria].push(produto);

      return grupo;
    }, {});
  }, [produtosFiltrados]);

  const categoriasFiltradas = Object.keys(produtosPorCategoria);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📋 Estoque da Loja</Text>

      <TextInput
        style={styles.pesquisa}
        placeholder="Pesquisar por nome, cor ou tamanho..."
        value={pesquisa}
        onChangeText={setPesquisa}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categorias}
        keyExtractor={(item) => item}
        style={styles.listaCategorias}
        contentContainerStyle={styles.categoriasContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.botaoCategoria,
              categoriaSelecionada === item && styles.categoriaAtiva,
            ]}
            onPress={() => setCategoriaSelecionada(item)}
          >
            <Text
              style={[
                styles.textoCategoria,
                categoriaSelecionada === item && styles.textoCategoriaAtiva,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.resumo}>
        Total encontrado: {produtosFiltrados.length} item(ns)
      </Text>

      <FlatList
        data={categoriasFiltradas}
        keyExtractor={(item) => item}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum produto encontrado.</Text>
        }
        renderItem={({ item: categoria }) => (
          <View style={styles.categoriaBox}>
            <Text style={styles.categoriaTitulo}>{categoria}</Text>

            {produtosPorCategoria[categoria].map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
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
    marginBottom: 15,
  },

  pesquisa: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    color: "#000",
  },

  listaCategorias: {
    marginBottom: 12,
    maxHeight: 50,
  },

  categoriasContent: {
    paddingVertical: 4,
  },

  botaoCategoria: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  categoriaAtiva: {
    backgroundColor: "#222",
  },

  textoCategoria: {
    color: "#222",
    fontWeight: "bold",
  },

  textoCategoriaAtiva: {
    color: "#fff",
  },

  resumo: {
    marginBottom: 12,
    fontWeight: "bold",
    color: "#555",
  },

  vazio: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 30,
  },

  categoriaBox: {
    marginBottom: 22,
  },

  categoriaTitulo: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 12,
  },
});