import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { Produto } from "../../src/types/Produto";
import { criarTabela } from "../../src/database/database";

import {
  salvarProduto,
  buscarProdutos,
  removerProduto,
  adicionarEstoque,
  removerEstoque,
} from "../../src/services/produtoService";

export default function HomeScreen() {
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [cor, setCor] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);



  useEffect(() => {
    iniciarBanco();
  }, []);

  function iniciarBanco() {
    criarTabela();
    carregarProdutos();
  }

  function carregarProdutos() {
    setProdutos(buscarProdutos());
  }

  function limparCampos() {
    setIdEditando(null);
    setNome("");
    setCategoria("");
    setTamanho("");
    setCor("");
    setQuantidade("");
    setPreco("");
  }

  function cadastrarOuEditar() {
    try {
      const produto: Produto = {
        id: idEditando ?? undefined,
        nome,
        categoria,
        tamanho,
        cor,
        quantidade: Number(quantidade),
        preco: Number(preco.replace(",", ".")),
      };

      salvarProduto(produto);

      Alert.alert(
        "Sucesso",
        idEditando ? "Produto atualizado!" : "Produto cadastrado!"
      );

      limparCampos();
      carregarProdutos();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  }

  function editar(item: Produto) {
    setIdEditando(item.id!);
    setNome(item.nome);
    setCategoria(item.categoria);
    setTamanho(item.tamanho || "");
    setCor(item.cor || "");
    setQuantidade(String(item.quantidade));
    setPreco(String(item.preco));
  }

  function excluir(id: number) {
    Alert.alert("Excluir produto", "Deseja realmente excluir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: () => {
          removerProduto(id);
          carregarProdutos();
        },
      },
    ]);
  }

  function entradaEstoque(item: Produto) {
    adicionarEstoque(item);
    carregarProdutos();
  }

  function saidaEstoque(item: Produto) {
    try {
      removerEstoque(item);
      carregarProdutos();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📦 Cadastro de Produtos</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da peça"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#666"
      />

      <TextInput
  style={styles.input}
  placeholder="Categoria"
  value={categoria}
  onChangeText={setCategoria}
  placeholderTextColor="#666"
/>

      <TextInput
        style={styles.input}
        placeholder="Tamanho"
        value={tamanho}
        onChangeText={setTamanho}
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Cor"
        value={cor}
        onChangeText={setCor}
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Preço"
        keyboardType="decimal-pad"
        value={preco}
        onChangeText={setPreco}
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.botaoSalvar} onPress={cadastrarOuEditar}>
        <Text style={styles.textoBotao}>
          {idEditando ? "Salvar Alterações" : "Cadastrar Produto"}
        </Text>
      </TouchableOpacity>

      {idEditando && (
        <TouchableOpacity style={styles.botaoCancelar} onPress={limparCampos}>
          <Text style={styles.textoBotao}>Cancelar Edição</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nomeProduto}>{item.nome}</Text>
            <Text>Categoria: {item.categoria}</Text>
            <Text>Quantidade: {item.quantidade}</Text>
            <Text>R$ {item.preco.toFixed(2)}</Text>

            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={styles.botaoEditar}
                onPress={() => editar(item)}
              >
                <Text style={styles.botaoTexto}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={() => excluir(item.id!)}
              >
                <Text style={styles.botaoTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={styles.botaoEstoque}
                onPress={() => entradaEstoque(item)}
              >
                <Text style={styles.botaoTexto}>+ Estoque</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoEstoque}
                onPress={() => saidaEstoque(item)}
              >
                <Text style={styles.botaoTexto}>- Estoque</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "#F4F6F8",
    marginTop: 45,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

input: {
  backgroundColor: "#fff",
  padding: 14,
  borderRadius: 14,
  marginBottom: 10,
  color: "#000",
  fontSize: 16,
},

  botaoSalvar: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  botaoCancelar: {
    backgroundColor: "#777",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
  },

  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
  },

  nomeProduto: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  botoesContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  botaoEditar: {
    flex: 1,
    backgroundColor: "#2E86DE",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  botaoExcluir: {
    flex: 1,
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  botaoEstoque: {
    flex: 1,
    backgroundColor: "#27AE60",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});