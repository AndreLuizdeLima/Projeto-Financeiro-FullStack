import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCentroDeCustoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
