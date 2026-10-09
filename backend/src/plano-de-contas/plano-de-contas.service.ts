import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreatePlanoDeContaDto } from './dto/create-plano-de-conta.dto';
import { UpdatePlanoDeContaDto } from './dto/update-plano-de-conta.dto';
import { PlanoDeConta } from './entities/plano-de-conta.entity';
import { Repository, type EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { NaturezaConta } from './dto/natureza-da-conta';
import { User } from '@/users/entities/user.entity';
import {
  CODIGOS_RAIZ,
  MAX_NIVEIS_PLANO_DE_CONTAS,
} from './plano-de-contas.constants';
import {
  calcularProximoCodigo,
  extrairNumeroDoFilho,
} from './utils/calcular-proximo-codigo';

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
      const filhos = await repository.find({
        where: { contaPai: { id: pai.id } },
        select: { codigo: true },
      });

      const plano = repository.create({
        nome: dto.nome,
        tipo: dto.tipo,
        natureza: NaturezaConta.ANALITICA,
        contaPai: pai,
        codigo: calcularProximoCodigo(
          pai.codigo,
          filhos.map((filho) => filho.codigo),
        ),
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
    if ('contaPaiId' in dto || 'contaPai' in dto || 'codigo' in dto) {
      throw new UnprocessableEntityException(
        'O pai e o código da conta não podem ser informados na edição.',
      );
    }
    if (
      [dto.nome, dto.tipo, dto.natureza, dto.isActive].some(
        (valor) => valor === null,
      ) ||
      (dto.isActive !== undefined && typeof dto.isActive !== 'boolean')
    ) {
      throw new UnprocessableEntityException(
        'Os campos não podem ser nulos e isActive deve ser booleano.',
      );
    }

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

      if (dto.nome !== undefined) plano.nome = dto.nome;
      if (dto.tipo !== undefined) plano.tipo = dto.tipo;
      if (dto.isActive !== undefined) plano.isActive = dto.isActive;

      return repository.save(plano);
    });
  }

  async remove(id: number) {
    return this.update(id, { isActive: false });
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
        // Serializa operações do módulo para proteger a sequência dos cadastros.
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
      if (visitados.has(atual.id)) {
        throw new UnprocessableEntityException('A hierarquia contém um ciclo.');
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

      extrairNumeroDoFilho(atual.codigo, atual.contaPai.codigo);
      const ancestral = await repository.findOne({
        where: { id: atual.contaPai.id },
        relations: { contaPai: true },
      });
      if (!ancestral) throw new NotFoundException('Conta pai não encontrada.');
      atual = ancestral;
      nivel += 1;
    }
  }

  private validarNivel(nivel: number) {
    if (nivel > MAX_NIVEIS_PLANO_DE_CONTAS) {
      throw new UnprocessableEntityException(
        `O plano de contas permite no máximo ${MAX_NIVEIS_PLANO_DE_CONTAS} níveis, incluindo a raiz.`,
      );
    }
  }
}
