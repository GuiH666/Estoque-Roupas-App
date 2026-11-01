/**
 * Cria um objeto que, a cada leitura, consulta a função `fabrica`.
 *
 * É assim que `COLORS.text` continua funcionando em todo o app mesmo com dois
 * temas: o objeto é sempre o mesmo, mas o valor que sai dele depende do tema
 * que está valendo naquele momento. Também funciona com `...TYPE.title`.
 */
export function viva<T extends object>(fabrica: () => T): T {
  /*
   * Só a leitura (get) é interceptada. Não use este objeto onde ele precise ser
   * copiado ou percorrido (espalhar com "...", Object.keys, passar direto para
   * um componente): leia a propriedade que precisa, como em `...TYPE.title`.
   * Estilos que vão direto para componentes (sombras) são funções em tokens.ts.
   */
  return new Proxy({} as T, {
    get: (_alvo, chave) => (fabrica() as any)[chave],
  });
}
