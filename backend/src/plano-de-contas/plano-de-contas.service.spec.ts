import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  FindOperator,
  type EntityManager,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  type Repository,
} from 'typeorm';
import type { User } from '@/users/entities/user.entity';
import type { AuthenticatedRequest } from '@/auth/guards/jwt-auth.guard';
import { CreatePlanoDeContaDto } from './dto/create-plano-de-conta.dto';
import { NaturezaConta } from './dto/natureza-da-conta';
import { TipoPlanoConta } from './dto/tipo-de-plano.enum';
import type { PlanoDeConta } from './entities/plano-de-conta.entity';
import type { PlanoDeContasService } from './plano-de-contas.service';
import type { PlanoDeContasController as ControllerPlano } from './plano-de-contas.controller';

// Isola o grafo de entidades de outros módulos nos testes unitários em ESM.
jest.unstable_mockModule('@/users/entities/user.entity', () => ({
  User: class {
    id!: number;
  },
}));
const { User: Usuario } = (await import('@/users/entities/user.entity')) as {
  User: new () => User;
};
const { PlanoDeConta: EntidadePlano } =
  (await import('./entities/plano-de-conta.entity')) as {
    PlanoDeConta: new () => PlanoDeConta;
  };
const { PlanoDeContasService: ServicoPlano } =
  (await import('./plano-de-contas.service')) as {
    PlanoDeContasService: new (
      repository: Repository<PlanoDeConta>,
    ) => PlanoDeContasService;
  };
const { PlanoDeContasController } =
  (await import('./plano-de-contas.controller')) as {
    PlanoDeContasController: new (
      service: PlanoDeContasService,
    ) => ControllerPlano;
  };

describe('PlanoDeContasService', () => {
  let contas: Map<number, PlanoDeConta>;
  let service: PlanoDeContasService;
  let repository: {
    findOne: ReturnType<
      typeof jest.fn<
        (options: FindOneOptions<PlanoDeConta>) => Promise<PlanoDeConta | null>
      >
    >;
    find: ReturnType<
      typeof jest.fn<
        (options: FindManyOptions<PlanoDeConta>) => Promise<PlanoDeConta[]>
      >
    >;
    create: ReturnType<
      typeof jest.fn<(dados: Partial<PlanoDeConta>) => PlanoDeConta>
    >;
    save: ReturnType<
      typeof jest.fn<
        (
          dados: PlanoDeConta | PlanoDeConta[],
        ) => Promise<PlanoDeConta | PlanoDeConta[]>
      >
    >;
    manager: { transaction: ReturnType<typeof jest.fn> };
  };
  let buscarUsuario: ReturnType<
    typeof jest.fn<(options: FindOneOptions<User>) => Promise<User | null>>
  >;
  let executarQuery: ReturnType<
    typeof jest.fn<(sql: string, parametros: unknown[]) => void>
  >;
  let raiz: PlanoDeConta;

  const dto = (contaPaiId: number): CreatePlanoDeContaDto => ({
    nome: 'Estoque',
    tipo: TipoPlanoConta.ATIVO,
    natureza: NaturezaConta.ANALITICA,
    contaPaiId,
  });

  function adicionar(
    id: number,
    codigo: string,
    pai: PlanoDeConta | null = raiz,
  ): PlanoDeConta {
    const conta = Object.assign(new EntidadePlano(), {
      id,
      codigo,
      nome: codigo,
      tipo: TipoPlanoConta.ATIVO,
      natureza: pai ? NaturezaConta.ANALITICA : NaturezaConta.SINTETICA,
      contaPai: pai,
      isActive: true,
    });
    contas.set(id, conta);
    return conta;
  }

  function copiar(conta: PlanoDeConta): PlanoDeConta {
    return Object.assign(new EntidadePlano(), conta, {
      contaPai: conta.contaPai ? { ...contas.get(conta.contaPai.id) } : null,
    });
  }

  function cadeia(niveis: number): PlanoDeConta {
    let pai = raiz;
    for (let nivel = 2; nivel <= niveis; nivel++) {
      pai = adicionar(1000 + nivel, `${pai.codigo}.1`, pai);
    }
    return pai;
  }

  beforeEach(() => {
    contas = new Map();
    raiz = adicionar(101, '1', null);
    buscarUsuario = jest
      .fn<(options: FindOneOptions<User>) => Promise<User | null>>()
      .mockResolvedValue(Object.assign(new Usuario(), { id: 7 }));
    executarQuery = jest.fn();
    let bloqueio = Promise.resolve();

    repository = {
      findOne: jest.fn((options: FindOneOptions<PlanoDeConta>) => {
        const { id } = options.where as FindOptionsWhere<PlanoDeConta>;
        const conta = typeof id === 'number' ? contas.get(id) : undefined;
        return Promise.resolve(conta ? copiar(conta) : null);
      }),
      find: jest.fn((options: FindManyOptions<PlanoDeConta>) => {
        const where = options.where as FindOptionsWhere<PlanoDeConta>;
        const { id } = where.contaPai as FindOptionsWhere<PlanoDeConta>;
        const ids =
          id instanceof FindOperator ? (id.value as unknown as number[]) : [id];
        return Promise.resolve(
          [...contas.values()]
            .filter(
              (conta) => conta.contaPai && ids.includes(conta.contaPai.id),
            )
            .map(copiar),
        );
      }),
      create: jest.fn((dados: Partial<PlanoDeConta>) =>
        Object.assign(new EntidadePlano(), dados),
      ),
      save: jest.fn((dados: PlanoDeConta | PlanoDeConta[]) => {
        const lista = Array.isArray(dados) ? dados : [dados];
        for (const conta of lista) {
          if (!conta.id) conta.id = Math.max(...contas.keys()) + 1;
          if (
            [...contas.values()].some(
              (outra) => outra.id !== conta.id && outra.codigo === conta.codigo,
            )
          ) {
            throw new Error('Código duplicado');
          }
          contas.set(conta.id, copiar(conta));
        }
        return Promise.resolve(dados);
      }),
      manager: {
        transaction: jest.fn(
          async (
            _isolamento: string,
            operacao: (manager: EntityManager) => Promise<unknown>,
          ) => {
            let liberar: (() => void) | undefined;
            let snapshot: Map<number, PlanoDeConta> | undefined;
            const manager = {
              getRepository: (entity: unknown) =>
                entity === Usuario ? { findOne: buscarUsuario } : repository,
              query: async (sql: string, parametros: unknown[]) => {
                executarQuery(sql, parametros);
                if (sql.includes('pg_advisory_xact_lock')) {
                  const anterior = bloqueio;
                  bloqueio = new Promise<void>((resolve) => {
                    liberar = resolve;
                  });
                  await anterior;
                  snapshot = new Map(
                    [...contas].map(([id, conta]) => [id, copiar(conta)]),
                  );
                }
              },
            } as unknown as EntityManager;
            try {
              return await operacao(manager);
            } catch (error) {
              if (snapshot) contas = snapshot;
              throw error;
            } finally {
              liberar?.();
            }
          },
        ),
      },
    };
    service = new ServicoPlano(
      repository as unknown as Repository<PlanoDeConta>,
    );
  });

  it('o controller encaminha o criador obtido do JWT', async () => {
    const controller = new PlanoDeContasController(service);
    await controller.create(dto(raiz.id), {
      user: { sub: 7 },
    } as AuthenticatedRequest);
    expect(buscarUsuario).toHaveBeenCalledWith({
      where: { id: 7 },
      select: { id: true },
    });
  });

  it('cria um analítico com código automático, pai e usuário autenticado', async () => {
    const plano = await service.create(dto(raiz.id), 7);

    expect(plano).toMatchObject({
      codigo: '1.1',
      natureza: NaturezaConta.ANALITICA,
      contaPai: { id: raiz.id },
      criadoPor: { id: 7 },
      isActive: true,
    });
    expect(buscarUsuario).toHaveBeenCalledWith({
      where: { id: 7 },
      select: { id: true },
    });
  });

  it('usa o maior número dos filhos diretos, incluindo inativos, e continua em 1.10', async () => {
    const filho = adicionar(201, '1.2');
    adicionar(202, '1.9').isActive = false;
    adicionar(203, '1.2.99', filho);

    expect(await service.create(dto(raiz.id), 7)).toMatchObject({
      codigo: '1.10',
    });
  });

  it('permite que analíticos tenham filhos e mantém todos como analíticos', async () => {
    const pai = adicionar(201, '1.1');
    const filho = await service.create(dto(pai.id), 7);

    expect(filho.codigo).toBe('1.1.1');
    expect(filho.natureza).toBe(NaturezaConta.ANALITICA);
    expect(contas.get(pai.id)?.natureza).toBe(NaturezaConta.ANALITICA);
  });

  it('aceita o décimo nível, contando a raiz', async () => {
    const pai = cadeia(9);
    const filho = await service.create(dto(pai.id), 7);
    expect(filho.codigo.split('.')).toHaveLength(10);
  });

  it('rejeita a criação do décimo primeiro nível sem salvar', async () => {
    await expect(service.create(dto(cadeia(10).id), 7)).rejects.toThrow(
      UnprocessableEntityException,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejeita criação de sintéticos', async () => {
    await expect(
      service.create({ ...dto(raiz.id), natureza: NaturezaConta.SINTETICA }, 7),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('retorna 404 para um pai inexistente', async () => {
    await expect(service.create(dto(999), 7)).rejects.toThrow(
      NotFoundException,
    );
  });

  it.each([null, undefined, 0, -1, 1.5])(
    'rejeita pai inválido: %s',
    async (id) => {
      await expect(
        service.create(dto(id as unknown as number), 7),
      ).rejects.toThrow(UnprocessableEntityException);
    },
  );

  it('rejeita um sintético que possui pai', async () => {
    const pai = adicionar(201, '1.1');
    pai.natureza = NaturezaConta.SINTETICA;
    await expect(service.create(dto(pai.id), 7)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('rejeita um analítico sem pai', async () => {
    const pai = adicionar(201, '1.1', null);
    pai.natureza = NaturezaConta.ANALITICA;
    await expect(service.create(dto(pai.id), 7)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('rejeita uma raiz que não corresponde aos códigos 1 a 4', async () => {
    raiz.codigo = '5';
    await expect(service.create(dto(raiz.id), 7)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('retorna 401 se o usuário autenticado não existe', async () => {
    buscarUsuario.mockResolvedValue(null);
    await expect(service.create(dto(raiz.id), 7)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('preserva o pai e os códigos quando o PATCH contém apenas o nome', async () => {
    const plano = adicionar(201, '1.7');
    adicionar(202, '1.7.1', plano);

    expect(await service.update(plano.id, { nome: 'Novo nome' })).toMatchObject(
      {
        nome: 'Novo nome',
        codigo: '1.7',
        contaPai: { id: raiz.id },
      },
    );
    expect(contas.get(202)?.codigo).toBe('1.7.1');
  });

  it('mantém o código quando o PATCH informa o mesmo pai', async () => {
    const plano = adicionar(201, '1.7');
    expect(
      await service.update(plano.id, { contaPaiId: raiz.id }),
    ).toMatchObject({ codigo: '1.7' });
  });

  it('troca o pai e recodifica toda a subárvore, preservando os outros ramos', async () => {
    const paiAnterior = adicionar(201, '1.1');
    const plano = adicionar(202, '1.1.1', paiAnterior);
    const filho = adicionar(203, '1.1.1.1', plano);
    adicionar(204, '1.1.1.1.1', filho);
    adicionar(205, '1.1.2', paiAnterior);
    const novoPai = adicionar(206, '1.2');
    adicionar(207, '1.2.9', novoPai);

    expect(
      await service.update(plano.id, { contaPaiId: novoPai.id }),
    ).toMatchObject({
      codigo: '1.2.10',
      contaPai: { id: novoPai.id },
    });
    expect(contas.get(203)?.codigo).toBe('1.2.10.1');
    expect(contas.get(204)?.codigo).toBe('1.2.10.1.1');
    expect(contas.get(205)?.codigo).toBe('1.1.2');
  });

  it('rejeita a própria conta como pai', async () => {
    const plano = adicionar(201, '1.1');
    await expect(
      service.update(plano.id, { contaPaiId: plano.id }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('rejeita um neto como novo pai', async () => {
    const plano = adicionar(201, '1.1');
    const filho = adicionar(202, '1.1.1', plano);
    const neto = adicionar(203, '1.1.1.1', filho);
    await expect(
      service.update(plano.id, { contaPaiId: neto.id }),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejeita uma mudança de pai que colocaria um descendente no nível 11', async () => {
    const novoPai = cadeia(9);
    const plano = adicionar(201, '1.2');
    adicionar(202, '1.2.1', plano);
    await expect(
      service.update(plano.id, { contaPaiId: novoPai.id }),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(contas.get(plano.id)?.codigo).toBe('1.2');
    expect(contas.get(202)?.codigo).toBe('1.2.1');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('aceita mudança de pai que deixa o descendente no nível 10', async () => {
    const novoPai = cadeia(8);
    const plano = adicionar(201, '1.2');
    adicionar(202, '1.2.1', plano);
    await service.update(plano.id, { contaPaiId: novoPai.id });
    expect(contas.get(202)?.codigo.split('.')).toHaveLength(10);
  });

  it('rejeita null como pai na edição', async () => {
    const plano = adicionar(201, '1.1');
    await expect(
      service.update(plano.id, { contaPaiId: null as unknown as number }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('rejeita alteração de natureza de analítico para sintético', async () => {
    const plano = adicionar(201, '1.1');
    await expect(
      service.update(plano.id, { natureza: NaturezaConta.SINTETICA }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('mantém as raízes sintéticas sem pai e com sua natureza e tipo originais', async () => {
    await expect(service.update(raiz.id, { contaPaiId: 999 })).rejects.toThrow(
      UnprocessableEntityException,
    );
    await expect(
      service.update(raiz.id, { natureza: NaturezaConta.ANALITICA }),
    ).rejects.toThrow(UnprocessableEntityException);
    await expect(
      service.update(raiz.id, { tipo: TipoPlanoConta.PASSIVO }),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('retorna 404 ao editar uma conta inexistente', async () => {
    await expect(service.update(999, { nome: 'Novo nome' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('usa o bloqueio transacional para evitar códigos repetidos em cadastros concorrentes', async () => {
    const resultados = await Promise.all([
      service.create(dto(raiz.id), 7),
      service.create(dto(raiz.id), 7),
      service.create(dto(raiz.id), 7),
    ]);
    expect(resultados.map((conta) => conta.codigo)).toEqual([
      '1.1',
      '1.2',
      '1.3',
    ]);
    expect(executarQuery).toHaveBeenCalledWith(
      'SELECT pg_advisory_xact_lock(hashtext($1))',
      ['plano-de-contas:hierarquia'],
    );
  });

  it('inativa logicamente sem remover vínculos ou reutilizar o código', async () => {
    const plano = adicionar(201, '1.1');
    await service.remove(plano.id);
    expect(contas.get(plano.id)).toMatchObject({
      isActive: false,
      codigo: '1.1',
    });
    expect(await service.create(dto(raiz.id), 7)).toMatchObject({
      codigo: '1.2',
    });
  });
});
