import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import type { Esquema } from "./paletas";
import {
  Preferencia,
  definirEsquema,
  esquemaAtual,
  lerPreferencia,
  resolver,
  salvarPreferencia,
} from "./tema";

type ValorTema = {
  /** O que a pessoa escolheu: sistema, claro ou escuro */
  preferencia: Preferencia;
  /** O tema que está aparecendo de fato */
  esquema: Esquema;
  escolher: (preferencia: Preferencia) => void;
};

const Contexto = createContext<ValorTema>({
  preferencia: "sistema",
  esquema: "escuro",
  escolher: () => {},
});

/**
 * Guarda a escolha de tema e avisa o app quando ela muda.
 *
 * Quando o tema muda, o layout raiz recria as telas (usando `esquema` como
 * chave), e todas passam a ler as cores do tema novo.
 *
 * No modo "sistema", o app só confere o tema do celular ao voltar para o
 * primeiro plano. Assim, o escurecimento automático do fim da tarde não
 * recarrega a tela no meio de um cadastro.
 */
export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [preferencia, setPreferencia] = useState<Preferencia>(() =>
    lerPreferencia()
  );
  const [esquema, setEsquema] = useState<Esquema>(() => esquemaAtual());

  const preferenciaRef = useRef(preferencia);
  useEffect(() => {
    preferenciaRef.current = preferencia;
  }, [preferencia]);

  const escolher = useCallback((nova: Preferencia) => {
    const novoEsquema = resolver(nova);
    definirEsquema(novoEsquema);
    salvarPreferencia(nova);
    setPreferencia(nova);
    setEsquema(novoEsquema);
  }, []);

  useEffect(() => {
    const assinatura = AppState.addEventListener("change", (estado) => {
      if (estado !== "active" || preferenciaRef.current !== "sistema") return;

      const doSistema = resolver("sistema");
      if (doSistema !== esquemaAtual()) {
        definirEsquema(doSistema);
        setEsquema(doSistema);
      }
    });

    return () => assinatura.remove();
  }, []);

  const valor = useMemo(
    () => ({ preferencia, esquema, escolher }),
    [preferencia, esquema, escolher]
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema() {
  return useContext(Contexto);
}
