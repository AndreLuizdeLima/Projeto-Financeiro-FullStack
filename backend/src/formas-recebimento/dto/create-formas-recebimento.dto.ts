import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFormasRecebimentoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
