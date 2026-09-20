export type TokenType = 'access' | 'refresh';

export class TokenPayLoadDto {
  sub!: number;
  email!: string;
  tokenType!: TokenType;
  iat!: number;
  exp!: number;
  aud!: string;
  iss!: string;
}
