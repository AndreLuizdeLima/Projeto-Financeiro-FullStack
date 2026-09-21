import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCentroDeCustoDto } from './dto/create-centro-de-custo.dto';
import { UpdateCentroDeCustoDto } from './dto/update-centro-de-custo.dto';
import { User } from '@/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentroDeCusto } from './entities/centro-de-custo.entity';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class CentroDeCustoService {
  constructor(
    @InjectRepository(CentroDeCusto)
    private readonly cetroDeCustoRepository: Repository<CentroDeCusto>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createCentroDeCustoDto: CreateCentroDeCustoDto,
    criadoPorId: number,
  ) {
    const user = await this.userRepository.findOneBy({
      id: criadoPorId,
    });

    if (!user) {
      throw new UnauthorizedException('Usuário autenticado não encontrado.');
    }

    const cliente = this.cetroDeCustoRepository.create({
      ...createCentroDeCustoDto,
      criadoPor: user,
      isActive: true,
    });

    return this.cetroDeCustoRepository.save(cliente);
  }

  async findAll({ page, limit }: PaginationQueryDto) {
    const [data, total] = await this.cetroDeCustoRepository.findAndCount({
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
    const centro = await this.cetroDeCustoRepository.findOne({
      where: { id },
    });
    if (!centro) {
      throw new NotFoundException('Centro de custo não encontrada.');
    }
    return centro;
  }

  async update(id: number, updateCentroDeCustoDto: UpdateCentroDeCustoDto) {
    const centro = await this.cetroDeCustoRepository.preload({
      id,
      ...updateCentroDeCustoDto,
    });

    if (!centro) {
      throw new NotFoundException('Centro de custo não encontrada.');
    }

    return this.cetroDeCustoRepository.save(centro);
  }

  async remove(id: number) {
    const centro = await this.cetroDeCustoRepository.preload({
      id,
      ...{
        isActive: false,
      },
    });

    if (!centro) {
      throw new NotFoundException('Centro de custo não encontrada.');
    }

    return this.cetroDeCustoRepository.save(centro);
  }
}
