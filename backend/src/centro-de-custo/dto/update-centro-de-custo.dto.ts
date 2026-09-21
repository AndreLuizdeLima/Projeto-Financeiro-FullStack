import { PartialType } from '@nestjs/mapped-types';
import { CreateCentroDeCustoDto } from './create-centro-de-custo.dto';
import { IsBoolean } from 'class-validator';

export class UpdateCentroDeCustoDto extends PartialType(
  CreateCentroDeCustoDto,
) {
  @IsBoolean()
  isActive!: boolean;
}
