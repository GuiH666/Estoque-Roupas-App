import React from "react";

import EmptyState from "./EmptyState";

type Props = {
  /** Mensagem técnica opcional (aparece em letra menor) */
  detalhe?: string | null;
  onTentar: () => void;
};

/** Tela de erro de leitura, com botão para tentar de novo. */
export default function ErrorState({ detalhe, onTentar }: Props) {
  return (
    <EmptyState
      tom="erro"
      icone="alert-circle-outline"
      titulo="Não foi possível carregar"
      texto="Algo deu errado ao ler os dados salvos no aparelho. Tente novamente."
      detalhe={detalhe ?? undefined}
      acao="Tentar novamente"
      onAcao={onTentar}
    />
  );
}
