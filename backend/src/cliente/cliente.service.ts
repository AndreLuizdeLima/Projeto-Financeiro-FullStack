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
    });

    return this.clienteRepository.save(cliente);
  }

  findAll() {
    return this.clienteRepository.find({
      take: 100,
      order: { id: 'DESC' },
    });
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
    const user = await this.clienteRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Cliente não encontrada.');
    }
    return this.clienteRepository.remove(user);
  }
}
