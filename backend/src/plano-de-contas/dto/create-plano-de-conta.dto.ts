import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { TipoPlanoConta } from './tipo-de-plano.enum';
import { NaturezaConta } from './natureza-da-conta';

export class CreatePlanoDeContaDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsEnum(TipoPlanoConta)
  tipo!: TipoPlanoConta;

  @IsEnum(NaturezaConta)
  natureza!: NaturezaConta;

  @IsInt()
  @Min(1)
  contaPaiId!: number;
}
