import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { TokenPayLoadDto } from '../dto/token-payload.dto';

export type AuthenticatedRequest = Request & {
  user?: TokenPayLoadDto;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = this.extractAccessToken(request);

    if (!accessToken) {
      throw new UnauthorizedException('Token de acesso não informado.');
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<TokenPayLoadDto>(accessToken);

      if (payload.tokenType !== 'access') {
        throw new UnauthorizedException('Token de acesso inválido.');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token de acesso inválido.');
    }
  }

  private extractAccessToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [scheme, token, ...additionalParts] = authorization
      .trim()
      .split(/\s+/);

    if (
      scheme?.toLowerCase() !== 'bearer' ||
      !token ||
      additionalParts.length
    ) {
      return undefined;
    }

    return token;
  }
}
