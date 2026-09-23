import { PartialType } from '@nestjs/mapped-types';
import { CreateContaBancariaDto } from './create-conta-bancaria.dto';
import { IsBoolean } from 'class-validator';

export class UpdateContaBancariaDto extends PartialType(
  CreateContaBancariaDto,
) {
  @IsBoolean()
  isActive!: boolean;
}
