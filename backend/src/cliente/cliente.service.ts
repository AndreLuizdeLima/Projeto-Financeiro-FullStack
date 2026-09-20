import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createClienteDto: CreateClienteDto, criadoPorId: number) {
    const user = await this.userRepository.findOneBy({
      id: criadoPorId,
    });

    if (!user) {
      throw new UnauthorizedException('Usuário autenticado não encontrado.');
    }

    const cliente = this.clienteRepository.create({
      ...createClienteDto,
      criadoPor: user,
      isActive: true,
    });

    return this.clienteRepository.save(cliente);
  }

  async findAll({ page, limit }: PaginationQueryDto) {
    const [data, total] = await this.clienteRepository.findAndCount({
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
    const userData = await this.clienteRepository.findOne({ where: { id } });
    if (!userData) {
      throw new NotFoundException('Cliente não encontrada.');
    }
    return userData;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    const cliente = await this.clienteRepository.preload({
      id,
      ...updateClienteDto,
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrada.');
    }

    return this.clienteRepository.save(cliente);
  }

  async remove(id: number) {
    const cliente = await this.clienteRepository.preload({
      id,
      ...{
        isActive: false,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrada.');
    }

    return this.clienteRepository.save(cliente);
  }
}
