import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  create(createClienteDto: CreateClienteDto) {
    return 'This action adds a new cliente';
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
