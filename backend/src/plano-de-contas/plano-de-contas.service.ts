import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePlanoDeContaDto } from './dto/create-plano-de-conta.dto';
import { UpdatePlanoDeContaDto } from './dto/update-plano-de-conta.dto';
import { PlanoDeConta } from './entities/plano-de-conta.entity';
import { In, Repository, type EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { NaturezaConta } from './dto/natureza-da-conta';
import { User } from '@/users/entities/user.entity';
import {
  CODIGOS_RAIZ,
  MAX_NIVEIS_PLANO_DE_CONTAS,
  MAX_TAMANHO_CODIGO_PLANO_DE_CONTAS,
} from './plano-de-contas.constants';

@Injectable()
export class PlanoDeContasService {
  constructor(
    @InjectRepository(PlanoDeConta)
    private readonly planoDeContaRepository: Repository<PlanoDeConta>,
  ) {}

  async create(dto: CreatePlanoDeContaDto, criadoPorId: number) {
    if (dto.natureza !== NaturezaConta.ANALITICA) {
      throw new UnprocessableEntityException(
        'Somente contas analíticas podem ser criadas.',
      );
    }

    return this.emTransacao(async (repository, manager) => {
      const criadoPor = await manager.getRepository(User).findOne({
        where: { id: criadoPorId },
        select: { id: true },
      });

      if (!criadoPor) {
        throw new UnauthorizedException('Usuário autenticado não encontrado.');
      }

      const { pai, nivel } = await this.validarPai(repository, dto.contaPaiId);
      this.validarNivel(nivel + 1);

      const plano = repository.create({
        nome: dto.nome,
        tipo: dto.tipo,
        natureza: NaturezaConta.ANALITICA,
        contaPai: pai,
        codigo: await this.proximoCodigo(repository, pai),
        criadoPor,
        isActive: true,
      });

      return repository.save(plano);
    });
  }

  async findAll({ page, limit }: PaginationQueryDto) {
    const [data, total] = await this.planoDeContaRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      meta: {
        page,
        total,
        hasNextPage: page * limit < total,
      },
    };
  }

  async findOne(id: number) {
    const plano = await this.planoDeContaRepository.findOne({
      where: { id },
    });
    if (!plano) {
      throw new NotFoundException('Plano de contas não encontrada.');
    }
    return plano;
  }

  async update(id: number, dto: UpdatePlanoDeContaDto) {
    return this.emTransacao(async (repository) => {
      const plano = await repository.findOne({
        where: { id },
        relations: { contaPai: true },
      });

      if (!plano) {
        throw new NotFoundException('Plano de contas não encontrado.');
      }

      if (dto.natureza !== undefined && dto.natureza !== plano.natureza) {
        throw new UnprocessableEntityException(
          'A natureza da conta não pode ser alterada.',
        );
      }

      if (
        plano.natureza === NaturezaConta.SINTETICA &&
        dto.tipo !== undefined &&
        dto.tipo !== plano.tipo
      ) {
        throw new UnprocessableEntityException(
          'O tipo de uma conta sintética raiz não pode ser alterado.',
        );
      }

      let contasParaSalvar = [plano];

      if (dto.contaPaiId !== undefined) {
        if (plano.natureza === NaturezaConta.SINTETICA) {
          throw new UnprocessableEntityException(
            'Contas sintéticas devem permanecer na raiz, sem pai.',
          );
        }

        const { pai, nivel } = await this.validarPai(
          repository,
          dto.contaPaiId,
          id,
        );
        this.validarNivel(nivel + 1);

        if (pai.id !== plano.contaPai?.id) {
          const subarvore = await this.buscarSubarvore(repository, plano);
          const codigoAnterior = plano.codigo;
          const novoCodigo = await this.proximoCodigo(repository, pai);

          const novosCodigos = subarvore.map(({ conta, nivelRelativo }) => {
            this.validarNivel(nivel + 1 + nivelRelativo);
            const codigo =
              novoCodigo + conta.codigo.slice(codigoAnterior.length);
            this.validarTamanhoCodigo(codigo);
            return codigo;
          });

          contasParaSalvar = subarvore.map(({ conta }, index) => {
            conta.codigo = novosCodigos[index];
            return conta;
          });
          plano.contaPai = pai;
        }
      }

      if (dto.nome !== undefined) plano.nome = dto.nome;
      if (dto.tipo !== undefined) plano.tipo = dto.tipo;

      await repository.save(contasParaSalvar);
      return plano;
    });
  }

  async remove(id: number) {
    return this.emTransacao(async (repository) => {
      const plano = await repository.findOne({ where: { id } });

      if (!plano) {
        throw new NotFoundException('Plano de contas não encontrado.');
      }

      plano.isActive = false;
      return repository.save(plano);
    });
  }

  private async emTransacao<T>(
    operacao: (
      repository: Repository<PlanoDeConta>,
      manager: EntityManager,
    ) => Promise<T>,
  ): Promise<T> {
    return this.planoDeContaRepository.manager.transaction(
      'READ COMMITTED',
      async (manager) => {
        // Serializa cadastros e mudanças de pai para proteger códigos e vínculos.
        await manager.query<void>(
          'SELECT pg_advisory_xact_lock(hashtext($1))',
          ['plano-de-contas:hierarquia'],
        );
        return operacao(manager.getRepository(PlanoDeConta), manager);
      },
    );
  }

  private async validarPai(
    repository: Repository<PlanoDeConta>,
    contaPaiId: number,
    contaId?: number,
  ) {
    if (!Number.isInteger(contaPaiId) || contaPaiId < 1) {
      throw new UnprocessableEntityException(
        'A conta pai deve ter um ID inteiro positivo.',
      );
    }

    const pai = await repository.findOne({
      where: { id: contaPaiId },
      relations: { contaPai: true },
    });

    if (!pai) throw new NotFoundException('Conta pai não encontrada.');

    const visitados = new Set<number>();
    let atual = pai;
    let nivel = 1;

    while (true) {
      if (atual.id === contaId || visitados.has(atual.id)) {
        throw new UnprocessableEntityException(
          'A conta não pode ter como pai ela mesma ou um de seus descendentes.',
        );
      }
      visitados.add(atual.id);
      this.validarNivel(nivel);

      if (atual.natureza === NaturezaConta.SINTETICA) {
        if (atual.contaPai || atual.codigo !== CODIGOS_RAIZ[atual.tipo]) {
          throw new UnprocessableEntityException(
            'A hierarquia deve começar em uma das quatro contas sintéticas raiz.',
          );
        }
        return { pai, nivel };
      }

      if (atual.natureza !== NaturezaConta.ANALITICA || !atual.contaPai) {
        throw new UnprocessableEntityException(
          'Uma conta analítica deve estar vinculada a uma conta pai.',
        );
      }

      this.numeroDoFilho(atual.codigo, atual.contaPai.codigo);
      const ancestral = await repository.findOne({
        where: { id: atual.contaPai.id },
        relations: { contaPai: true },
      });
      if (!ancestral) throw new NotFoundException('Conta pai não encontrada.');
      atual = ancestral;
      nivel += 1;
    }
  }

  private async proximoCodigo(
    repository: Repository<PlanoDeConta>,
    pai: PlanoDeConta,
  ) {
    const filhos = await repository.find({
      where: { contaPai: { id: pai.id } },
      select: { codigo: true },
    });
    const maiorNumero = filhos.reduce((maior, filho) => {
      const numero = this.numeroDoFilho(filho.codigo, pai.codigo);
      return numero > maior ? numero : maior;
    }, 0n);
    const codigo = `${pai.codigo}.${maiorNumero + 1n}`;
    this.validarTamanhoCodigo(codigo);
    return codigo;
  }

  private numeroDoFilho(codigo: string, codigoPai: string): bigint {
    const prefixo = `${codigoPai}.`;
    const numero = codigo.slice(prefixo.length);
    if (!codigo.startsWith(prefixo) || !/^[1-9]\d*$/.test(numero)) {
      throw new UnprocessableEntityException(
        'O código da conta é incompatível com a hierarquia existente.',
      );
    }
    return BigInt(numero);
  }

  private async buscarSubarvore(
    repository: Repository<PlanoDeConta>,
    plano: PlanoDeConta,
  ) {
    const subarvore = [{ conta: plano, nivelRelativo: 0 }];
    const visitados = new Set([plano.id]);
    let nivelAtual = [plano];
    let nivelRelativo = 1;

    while (nivelAtual.length) {
      const filhos = await repository.find({
        where: { contaPai: { id: In(nivelAtual.map((conta) => conta.id)) } },
        relations: { contaPai: true },
      });
      for (const filho of filhos) {
        if (visitados.has(filho.id) || !filho.contaPai) {
          throw new UnprocessableEntityException(
            'A hierarquia contém um ciclo.',
          );
        }
        this.validarNivel(nivelRelativo + 1);
        if (filho.natureza !== NaturezaConta.ANALITICA) {
          throw new UnprocessableEntityException(
            'Somente contas analíticas podem estar abaixo de outra conta.',
          );
        }
        this.numeroDoFilho(filho.codigo, filho.contaPai.codigo);
        visitados.add(filho.id);
        subarvore.push({ conta: filho, nivelRelativo });
      }
      nivelAtual = filhos;
      nivelRelativo += 1;
    }
    return subarvore;
  }

  private validarNivel(nivel: number) {
    if (nivel > MAX_NIVEIS_PLANO_DE_CONTAS) {
      throw new UnprocessableEntityException(
        `O plano de contas permite no máximo ${MAX_NIVEIS_PLANO_DE_CONTAS} níveis, incluindo a raiz.`,
      );
    }
  }

  private validarTamanhoCodigo(codigo: string) {
    if (codigo.length > MAX_TAMANHO_CODIGO_PLANO_DE_CONTAS) {
      throw new UnprocessableEntityException(
        'O código gerado excede o tamanho máximo permitido.',
      );
    }
  }
}
