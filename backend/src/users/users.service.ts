import {
  ConflictException,
  ForbiddenException,
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
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }

  const { code } = error;
  return typeof code === 'string' ? code : undefined;
}

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
        isActive: true,
      });
      await this.userRepository.save(newUser);
      const { passwordHash: _passwordHash, ...userReturn } = newUser;

      return userReturn;
    } catch (error) {
      if (getErrorCode(error) === '23505') {
        throw new ConflictException('Já existe um usuário com este e-mail.');
      }

      throw new InternalServerErrorException('Divergência ao criar usuário');
    }
  }

  async findAll({ page, limit }: PaginationQueryDto) {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
      select: {
        id: true,
        nome: true,
        email: true,
        isActive: true,
        createDate: true,
        updateDate: true,
      },
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
    const userData = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        isActive: true,
        createDate: true,
        updateDate: true,
      },
    });
    if (!userData) {
      throw new NotFoundException('Usuário não encontrada.');
    }
    return userData;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;

    const user = await this.userRepository.preload({ id });

    if (!user) {
      throw new NotFoundException('Usuário não encontrada.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Não é permitido editar usuário inativo.');
    }

    Object.assign(user, userData);

    if (password) {
      user.passwordHash = await this.hashingService.hash(password);
    }

    try {
      const { passwordHash: _passwordHash, ...userReturn } =
        await this.userRepository.save(user);
      return userReturn;
    } catch (error) {
      if (getErrorCode(error) === '23505') {
        throw new ConflictException('Já existe um usuário com este e-mail.');
      }

      throw new InternalServerErrorException(
        'Divergência ao atualizar usuário',
      );
    }
  }

  async remove(id: number, authenticatedUserId: number) {
    if (id === authenticatedUserId) {
      throw new ForbiddenException(
        'Não é permitido inativar o próprio usuário.',
      );
    }

    const user = await this.userRepository.preload({ id, isActive: false });
    if (!user) {
      throw new NotFoundException('Usuário não encontrada.');
    }

    const { passwordHash: _passwordHash, ...userReturn } =
      await this.userRepository.save(user);
    return userReturn;
  }
}
