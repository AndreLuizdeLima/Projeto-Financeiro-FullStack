import { PartialType } from '@nestjs/mapped-types';
import { CreateFormasRecebimentoDto } from './create-formas-recebimento.dto';
import { IsBoolean } from 'class-validator';

export class UpdateFormasRecebimentoDto extends PartialType(
  CreateFormasRecebimentoDto,
) {
  @IsBoolean()
  isActive!: boolean;
}
