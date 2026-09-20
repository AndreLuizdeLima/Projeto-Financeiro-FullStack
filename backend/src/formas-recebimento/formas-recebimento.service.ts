import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateFormasRecebimentoDto } from './dto/create-formas-recebimento.dto';
import { UpdateFormasRecebimentoDto } from './dto/update-formas-recebimento.dto';
import { Repository } from 'typeorm';
import { FormasRecebimento } from './entities/formas-recebimento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class FormasRecebimentoService {
  constructor(
    @InjectRepository(FormasRecebimento)
    private readonly formasRecebimentoRepository: Repository<FormasRecebimento>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createFormasRecebimentoDto: CreateFormasRecebimentoDto,
    criadoPorId: number,
  ) {
    const user = await this.userRepository.findOneBy({
      id: criadoPorId,
    });

    if (!user) {
      throw new UnauthorizedException('Usuário autenticado não encontrado.');
    }

    const cliente = this.formasRecebimentoRepository.create({
      ...createFormasRecebimentoDto,
      criadoPor: user,
      isActive: true,
    });

    return this.formasRecebimentoRepository.save(cliente);
  }

  async findAll({ page, limit }: PaginationQueryDto) {
    const [data, total] = await this.formasRecebimentoRepository.findAndCount({
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
    const formaData = await this.formasRecebimentoRepository.findOne({
      where: { id },
    });
    if (!formaData) {
      throw new NotFoundException('Forma de recebimento não encontrada.');
    }
    return formaData;
  }

  async update(
    id: number,
    updateFormasRecebimentoDto: UpdateFormasRecebimentoDto,
  ) {
    const forma = await this.formasRecebimentoRepository.preload({
      id,
      ...updateFormasRecebimentoDto,
    });

    if (!forma) {
      throw new NotFoundException('Forma de recebimento não encontrada.');
    }

    return this.formasRecebimentoRepository.save(forma);
  }

  async remove(id: number) {
    const forma = await this.formasRecebimentoRepository.preload({
      id,
      ...{
        isActive: false,
      },
    });

    if (!forma) {
      throw new NotFoundException('Forma de recebimento não encontrada.');
    }

    return this.formasRecebimentoRepository.save(forma);
  }
}
