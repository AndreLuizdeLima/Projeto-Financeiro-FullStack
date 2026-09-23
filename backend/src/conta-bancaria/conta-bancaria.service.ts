import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateContaBancariaDto } from './dto/create-conta-bancaria.dto';
import { UpdateContaBancariaDto } from './dto/update-conta-bancaria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContaBancaria } from './entities/conta-bancaria.entity';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class ContaBancariaService {
  constructor(
    @InjectRepository(ContaBancaria)
    private readonly contaBancariaRepository: Repository<ContaBancaria>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createContaBancariaDto: CreateContaBancariaDto,
    criadoPorId: number,
  ) {
    const user = await this.userRepository.findOneBy({
      id: criadoPorId,
    });

    if (!user) {
      throw new UnauthorizedException('Usuário autenticado não encontrado.');
    }

    const cliente = this.contaBancariaRepository.create({
      ...createContaBancariaDto,
      criadoPor: user,
      isActive: true,
    });

    return this.contaBancariaRepository.save(cliente);
  }

  async findAll({ page, limit }: PaginationQueryDto) {
    const [data, total] = await this.contaBancariaRepository.findAndCount({
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
    const contaData = await this.contaBancariaRepository.findOne({
      where: { id },
    });
    if (!contaData) {
      throw new NotFoundException('Conta bancárias não encontrada.');
    }
    return contaData;
  }

  async update(id: number, updateContaBancariaDto: UpdateContaBancariaDto) {
    const forma = await this.contaBancariaRepository.preload({
      id,
      ...updateContaBancariaDto,
    });

    if (!forma) {
      throw new NotFoundException('Conta bancárias não encontrada.');
    }

    return this.contaBancariaRepository.save(forma);
  }

  async remove(id: number) {
    const conta = await this.contaBancariaRepository.preload({
      id,
      ...{
        isActive: false,
      },
    });

    if (!conta) {
      throw new NotFoundException('Conta bancárias não encontrada.');
    }

    return this.contaBancariaRepository.save(conta);
  }
}
