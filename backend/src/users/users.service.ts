import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '@/auth/hashing/hashing.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createUserDto.password,
      );
      const newUser = this.userRepository.create({
        nome: createUserDto.nome,
        email: createUserDto.email,
        passwordHash,
      });
      await this.userRepository.save(newUser);
      const { passwordHash: _passwordHash, ...userReturn } = newUser;

      return userReturn;
    } catch {
      throw new InternalServerErrorException('Divergência ao criar usuário');
    }
  }

  // Futuramente implementar paginação
  findAll() {
    return this.userRepository.find({
      take: 100,
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const userData = await this.userRepository.findOne({ where: { id } });
    if (!userData) {
      throw new NotFoundException('Usuário não encontrada.');
    }
    return userData;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;

    const user = await this.userRepository.preload({
      id,
      ...userData,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrada.');
    }

    if (password) {
      user.passwordHash = await this.hashingService.hash(password);
    }

    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Usuário não encontrada.');
    }
    return this.userRepository.remove(user);
  }
}
