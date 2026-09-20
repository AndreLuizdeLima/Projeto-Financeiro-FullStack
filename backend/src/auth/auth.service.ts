import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import jwtConfig from './config/jdw_config';
import { LoginDto } from './dto/login.dto';
import { TokenPayLoadDto, TokenType } from './dto/token-payload.dto';
import { HashingService } from './hashing/hashing.service';
import { User } from '@/users/entities/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AccessToken {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    if (!loginDto?.email || !loginDto.password) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const user = await this.userRepository.findOneBy({ email: loginDto.email });

    if (
      !user ||
      !(await this.hashingService.compare(loginDto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.createTokens(user.id, user.email);
  }

  async refresh(refreshToken?: string): Promise<AccessToken> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token inválido.');
      }

      const payload =
        await this.jwtService.verifyAsync<TokenPayLoadDto>(refreshToken);

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Refresh token inválido.');
      }

      return {
        accessToken: await this.createToken(
          payload.sub,
          payload.email,
          'access',
        ),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido.');
    }
  }

  private async createTokens(id: number, email: string): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createToken(id, email, 'access'),
      this.createToken(id, email, 'refresh'),
    ]);

    return { accessToken, refreshToken };
  }

  private createToken(
    id: number,
    email: string,
    type: TokenType,
  ): Promise<string> {
    if (type === 'refresh') {
      return this.jwtService.signAsync(
        this.createPayload(id, email, 'refresh'),
        {
          expiresIn: this.jwtConfiguration.refreshTokenTtl,
        },
      );
    }
    return this.jwtService.signAsync(this.createPayload(id, email, 'access'), {
      expiresIn: this.jwtConfiguration.accessTokenTtl,
    });
  }

  private createPayload(
    sub: number,
    email: string,
    tokenType: TokenType,
  ): Pick<TokenPayLoadDto, 'sub' | 'email' | 'tokenType'> {
    return { sub, email, tokenType };
  }
}
