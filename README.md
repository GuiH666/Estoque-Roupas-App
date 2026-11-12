# Estoque Roupas App

Aplicativo mobile para controle de estoque de uma loja de roupas, feito com React Native, Expo, TypeScript e SQLite. Funciona sem internet: os dados ficam guardados no próprio aparelho.

## Telas

<table align="center">
  <tr>
    <td align="center"><b>Início</b><br /><br /><img src="screenshots/inicio.jpg" width="250" /></td>
    <td align="center"><b>Início (continuação)</b><br /><br /><img src="screenshots/inicio-2.jpg" width="250" /></td>
    <td align="center"><b>Estoque</b><br /><br /><img src="screenshots/estoque.jpg" width="250" /></td>
  </tr>
  <tr>
    <td align="center"><b>Histórico</b><br /><br /><img src="screenshots/historico.jpg" width="250" /></td>
    <td align="center"><b>Dashboard</b><br /><br /><img src="screenshots/dashboard.jpg" width="250" /></td>
    <td align="center"><b>Dashboard (continuação)</b><br /><br /><img src="screenshots/dashboard-2.jpg" width="250" /></td>
  </tr>
</table>

> Os prints acima estão no tema claro. O app também tem tema escuro.

## Funcionalidades

- **Início:** valor total em estoque, saúde do estoque (em dia, baixo e zerado), aviso de reposição, últimos cadastros e movimentações recentes.
- **Cadastro de produto:** etiqueta de prévia que se preenche enquanto você digita. Categoria, tamanho e cor escolhidos por botões, quantidade com + e −, preço com máscara em reais e a opção "Cadastrar e adicionar outro".
- **Estoque:** busca por nome, cor ou tamanho, filtro de estoque baixo, filtro por categoria e botões de +1 e −1 em cada produto.
- **Histórico:** entradas e saídas agrupadas por dia, com filtro.
- **Dashboard:** entradas e saídas dos últimos 7 dias, peças por categoria, maiores estoques por peças ou por valor e produtos que precisam de reposição.
- **Tema claro e escuro:** um botão na tela inicial alterna entre automático (segue o celular), claro e escuro, e a escolha fica salva no aparelho.
- **Estados da interface:** carregamento, lista vazia e erro com botão "Tentar novamente".
- **Acessibilidade:** respeita a opção "reduzir movimento" do sistema e tem rótulos para leitores de tela.

## Tecnologias

- [Expo](https://expo.dev) e React Native
- [Expo Router](https://docs.expo.dev/router/introduction/) para a navegação
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) para o banco de dados local
- TypeScript

## Como rodar

```bash
npm install
npx expo start
```

Depois, escaneie o QR code com o app Expo Go no celular.

## Como gerar o APK

```bash
eas build --platform android --profile preview
```

## Estrutura

```
app/                telas e navegação (Expo Router)
  (tabs)/           Início, Estoque, Histórico e Dashboard
  produto.tsx       cadastro e edição de produto
src/
  components/       componentes visuais (cartão de produto, barra de abas, etiqueta)
  database/         criação das tabelas e consultas SQLite
  hooks/            hooks do app (carregamento dos dados)
  services/         regras de negócio (produtos e movimentações)
  theme/            paletas clara e escura, tema e medidas do visual
  types/            tipos do TypeScript
  utils/            formatação, cores e funções de apoio
screenshots/        imagens usadas neste README
```

## Objetivo do projeto

Este projeto foi desenvolvido para praticar desenvolvimento mobile e criar uma solução real para controle de estoque de uma loja de roupas.

## Autor

**Guilherme Bomfim Ribeiro**
Estudante de Análise e Desenvolvimento de Sistemas

[GitHub](https://github.com/GuiH666)
