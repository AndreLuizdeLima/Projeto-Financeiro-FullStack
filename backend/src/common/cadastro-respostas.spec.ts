import { describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TipoDeContaBancaria } from '@/conta-bancaria/dto/tipo-de-conta.enum';

// Isola o grafo circular das entidades no ambiente de testes ESM.
jest.unstable_mockModule('@/users/entities/user.entity', () => ({
  User: class {},
}));
const { User } =
  (await import('@/users/entities/user.entity')) as typeof import('@/users/entities/user.entity');
const { ClienteService } =
  (await import('@/cliente/cliente.service')) as typeof import('@/cliente/cliente.service');
const { Cliente } =
  (await import('@/cliente/entities/cliente.entity')) as typeof import('@/cliente/entities/cliente.entity');
const { ContaBancariaService } =
  (await import('@/conta-bancaria/conta-bancaria.service')) as typeof import('@/conta-bancaria/conta-bancaria.service');
const { ContaBancaria } =
  (await import('@/conta-bancaria/entities/conta-bancaria.entity')) as typeof import('@/conta-bancaria/entities/conta-bancaria.entity');
const { CentroDeCustoService } =
  (await import('@/centro-de-custo/centro-de-custo.service')) as typeof import('@/centro-de-custo/centro-de-custo.service');
const { CentroDeCusto } =
  (await import('@/centro-de-custo/entities/centro-de-custo.entity')) as typeof import('@/centro-de-custo/entities/centro-de-custo.entity');
const { FormasRecebimentoService } =
  (await import('@/formas-recebimento/formas-recebimento.service')) as typeof import('@/formas-recebimento/formas-recebimento.service');
const { FormasRecebimento } =
  (await import('@/formas-recebimento/entities/formas-recebimento.entity')) as typeof import('@/formas-recebimento/entities/formas-recebimento.entity');

const cliente = {
  nomeFantasia: 'Cliente',
  razaoSocial: 'Cliente Ltda',
  cnpj: '12345678000199',
};
const conta = {
  nome: 'Banco',
  conta: '12345',
  tipo: TipoDeContaBancaria.ContaCorrente,
};
const nome = { nome: 'Cadastro' };
const casos = [
  {
    titulo: 'Clientes',
    service: ClienteService,
    entity: Cliente,
    dados: cliente,
    criar: (module: TestingModule) =>
      module.get(ClienteService).create(cliente, 7),
  },
  {
    titulo: 'Contas bancárias',
    service: ContaBancariaService,
    entity: ContaBancaria,
    dados: conta,
    criar: (module: TestingModule) =>
      module.get(ContaBancariaService).create(conta, 7),
  },
  {
    titulo: 'Centros de custo',
    service: CentroDeCustoService,
    entity: CentroDeCusto,
    dados: nome,
    criar: (module: TestingModule) =>
      module.get(CentroDeCustoService).create(nome, 7),
  },
  {
    titulo: 'Formas de recebimento',
    service: FormasRecebimentoService,
    entity: FormasRecebimento,
    dados: nome,
    criar: (module: TestingModule) =>
      module.get(FormasRecebimentoService).create(nome, 7),
  },
];

describe.each(casos)('Resposta pública na criação: $titulo', (caso) => {
  const preparar = async (usuario: object | null = { id: 7 }) => {
    const usuarios = {
      findOne: jest
        .fn<() => Promise<object | null>>()
        .mockResolvedValue(usuario),
    };
    // Simula uma entidade salva com dados adicionais: a resposta deve usar uma lista explícita de campos públicos.
    const registros = {
      create: jest.fn<(dados: object) => object>((dados) => dados),
      save: jest.fn<() => Promise<object>>().mockResolvedValue({
        id: 42,
        ...caso.dados,
        isActive: true,
        criadoPor: {
          id: 7,
          nome: 'Usuário',
          email: 'teste@example.com',
          passwordHash: 'hash-ficticio',
        },
        passwordHash: 'hash-ficticio',
      }),
    };
    const module = await Test.createTestingModule({
      providers: [
        caso.service,
        { provide: getRepositoryToken(caso.entity), useValue: registros },
        { provide: getRepositoryToken(User), useValue: usuarios },
      ],
    }).compile();
    return { module, registros, usuarios };
  };

  it('retorna apenas os campos públicos, sem usuário ou hash, preservando o ID do novo cadastro', async () => {
    const { module } = await preparar();
    try {
      const resposta: unknown = JSON.parse(
        JSON.stringify(await caso.criar(module)),
      );
      expect(resposta).toEqual({ id: 42, ...caso.dados, isActive: true });
    } finally {
      await module.close();
    }
  });

  it('carrega somente o ID e mantém o vínculo do criador na persistência', async () => {
    const { module, registros, usuarios } = await preparar({
      id: 7,
      passwordHash: 'hash-ficticio',
      email: 'teste@example.com',
    });
    try {
      await caso.criar(module);
      expect(usuarios.findOne).toHaveBeenCalledWith({
        where: { id: 7 },
        select: { id: true },
      });
      expect(registros.create).toHaveBeenCalledWith({
        ...caso.dados,
        criadoPor: { id: 7 },
        isActive: true,
      });
      expect(registros.save).toHaveBeenCalledTimes(1);
    } finally {
      await module.close();
    }
  });

  it('rejeita criador inexistente antes de salvar', async () => {
    const { module, registros } = await preparar(null);
    try {
      await expect(caso.criar(module)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(registros.save).not.toHaveBeenCalled();
    } finally {
      await module.close();
    }
  });
});
