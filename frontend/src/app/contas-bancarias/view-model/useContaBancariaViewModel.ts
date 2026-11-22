import { useMemo, useRef, useState } from "react";
import { useCadastro } from "@/app/cadastros/view-model/useCadastro";
import type { CadastroApi } from "@/app/cadastros/model/cadastro";
import {
  api,
  type ContaBancaria,
  type CriarContaComSaldo,
  type AtualizarContaBancaria,
} from "../model/contas-bancarias";
import { lancarSaldoInicial } from "../model/saldo-inicial";

export const useContaBancariaViewModel = () => {
  const pendente = useRef<ContaBancaria | null>(null);
  const [contaCriada, setContaCriada] = useState(false);
  const apiComSaldo = useMemo<
    CadastroApi<ContaBancaria, CriarContaComSaldo, AtualizarContaBancaria>
  >(
    () => ({
      ...api,
      criar: async (request, { saldoInicial, ...dados }) => {
        const conta = pendente.current ?? (await api.criar(request, dados));
        if (saldoInicial) {
          pendente.current = conta;
          setContaCriada(true);
          try {
            await lancarSaldoInicial(request, conta.id, saldoInicial);
          } catch (erro: unknown) {
            throw new Error(
              `A conta #${conta.id} foi criada, mas não foi possível confirmar o saldo inicial. ${erro instanceof Error ? erro.message : "Tente novamente."} Ao salvar novamente, será reenviado somente o saldo. Se houve falha de conexão, confira as movimentações antes de repetir.`,
              { cause: erro },
            );
          }
        }
        pendente.current = null;
        setContaCriada(false);
        return conta;
      },
    }),
    [],
  );
  const vm = useCadastro(apiComSaldo, {
    nome: (item) => item.nome,
    podeEditar: () => true,
    reativacao: () => ({ isActive: true }),
  });
  const limpar = () => {
    pendente.current = null;
    setContaCriada(false);
  };
  return {
    ...vm,
    contaCriada,
    abrir: (...args: Parameters<typeof vm.abrir>) => {
      if (!vm.ocupado) limpar();
      return vm.abrir(...args);
    },
    fechar: () => {
      if (!vm.ocupado) limpar();
      vm.fechar();
    },
    salvar: async (payload: CriarContaComSaldo | AtualizarContaBancaria) => {
      const sucesso = await vm.salvar(payload);
      if (!sucesso && pendente.current) vm.recarregar(1);
      return sucesso;
    },
  };
};
