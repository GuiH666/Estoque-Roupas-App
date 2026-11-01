import { useCallback, useState } from "react";

export type StatusCarga = "carregando" | "ok" | "erro";

/**
 * Executa a leitura dos dados e guarda como ela terminou:
 *  - "carregando": ainda não leu nada (primeiro desenho da tela)
 *  - "ok": leu e a tela pode mostrar os dados (ou o estado vazio)
 *  - "erro": a leitura falhou; a tela mostra "Tentar novamente"
 *
 * Isso evita dois defeitos comuns: o estado vazio piscar antes dos dados
 * chegarem e o app quebrar quando o banco falha.
 *
 * `ler` precisa ser estável (use useCallback).
 */
export function useCarregar(ler: () => void) {
  const [status, setStatus] = useState<StatusCarga>("carregando");
  const [erro, setErro] = useState<string | null>(null);

  const executar = useCallback(() => {
    try {
      ler();
      setErro(null);
      setStatus("ok");
    } catch (e: any) {
      setErro(e?.message ? String(e.message) : null);
      setStatus("erro");
    }
  }, [ler]);

  return { status, erro, executar };
}
