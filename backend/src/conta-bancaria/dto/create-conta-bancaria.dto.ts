import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TipoDeContaBancaria } from './tipo-de-conta.enum';

export class CreateContaBancariaDto {
  @IsNotEmpty()
  @IsString()
  nome!: string;

  @IsNotEmpty()
  @IsString()
  conta!: string;

  @IsNotEmpty()
  @IsEnum(TipoDeContaBancaria, {
    message: 'tipo deve ser ContaCorrente, ContaPoupanca ou ContaSalario',
  })
  tipo!: TipoDeContaBancaria;
}
