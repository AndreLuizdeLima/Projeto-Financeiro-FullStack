import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  razaoSocial!: string;

  @IsString()
  @IsNotEmpty()
  nomeFantasia!: string;
}
