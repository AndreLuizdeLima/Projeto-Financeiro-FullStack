import type { Plano, TipoPlano } from "./plano-de-contas";
export type NoPlano = {
  conta: Plano;
  pai?: NoPlano;
  filhos: NoPlano[];
  valido: boolean;
  nivel: number;
};
export function compararCodigos(a: string, b: string): number {
  const aa = a.split("."),
    bb = b.split(".");
  if (![...aa, ...bb].every(p => /^[1-9]\d*$/.test(p))) return a.localeCompare(b);
  for (let i = 0; i < Math.min(aa.length, bb.length); i++) {
    const x = BigInt(aa[i]),
      y = BigInt(bb[i]);
    if (x !== y) return x < y ? -1 : 1;
  }
  return aa.length - bb.length;
}
export function montarHierarquia(contas: Plano[]) {
  const nos: NoPlano[] = contas.map(conta => ({
    conta,
    filhos: [],
    valido: false,
    nivel: conta.codigo.split(".").length
  }));
  const codigos = new Map<string, NoPlano[]>();
  for (const no of nos) codigos.set(no.conta.codigo, [...(codigos.get(no.conta.codigo) ?? []), no]);
  const raizes: NoPlano[] = [],
    inconsistentes: NoPlano[] = [];
  const tiposRaiz: Record<string, TipoPlano> = {
    "1": "ATIVO",
    "2": "PASSIVO",
    "3": "RECEITA",
    "4": "DESPESA"
  };
  nos.sort((a, b) => compararCodigos(a.conta.codigo, b.conta.codigo));
  for (const no of nos) {
    const c = no.conta;
    const formatoValido = /^[1-9]\d*(\.[1-9]\d*)*$/.test(c.codigo) && c.codigo.length <= 255 && no.nivel <= 10 && codigos.get(c.codigo)?.length === 1;
    if (formatoValido && no.nivel === 1 && c.natureza === "SINTETICA" && tiposRaiz[c.codigo] === c.tipo) {
      no.valido = true;
      raizes.push(no);
    } else if (formatoValido && c.natureza === "ANALITICA") {
      const pai = codigos.get(c.codigo.slice(0, c.codigo.lastIndexOf(".")))?.[0];
      if (pai?.valido) {
        no.pai = pai;
        no.valido = true;
        pai.filhos.push(no);
      }
    }
    if (!no.valido) inconsistentes.push(no);
  }
  return {
    nos,
    raizes,
    inconsistentes
  };
}
export function caminho(no: NoPlano) {
  const partes: string[] = [];
  for (let atual: NoPlano | undefined = no; atual; atual = atual.pai) partes.unshift(`${atual.conta.codigo} · ${atual.conta.nome}`);
  return partes.join(" / ");
}
export type Filtros = {
  busca: string;
  tipo: string;
  situacao: string;
};
export function filtrarHierarquia(nos: NoPlano[], filtros: Filtros, expandidos: Set<number>, codigoRevelado?: string) {
  const termo = filtros.busca.trim().toLocaleLowerCase("pt-BR");
  const filtrando = !!termo || filtros.tipo !== "todos" || filtros.situacao !== "todos";
  const correspondentes = new Set(nos.filter(({
    conta: c
  }) => (!termo || `${c.codigo} ${c.nome}`.toLocaleLowerCase("pt-BR").includes(termo)) && (filtros.tipo === "todos" || c.tipo === filtros.tipo) && (filtros.situacao === "todos" || c.isActive === (filtros.situacao === "ativos"))).map(n => n.conta.id));
  const visiveis = new Set(correspondentes);
  if (filtrando) for (const no of nos) if (correspondentes.has(no.conta.id) || no.conta.codigo === codigoRevelado) {
    visiveis.add(no.conta.id);
    for (let pai = no.pai; pai; pai = pai.pai) visiveis.add(pai.conta.id);
  }
  const linhas = nos.filter(no => {
    if (filtrando) return visiveis.has(no.conta.id);
    for (let pai = no.pai; pai; pai = pai.pai) if (!expandidos.has(pai.conta.id)) return false;
    return true;
  });
  return {
    linhas,
    correspondentes,
    filtrando
  };
}
